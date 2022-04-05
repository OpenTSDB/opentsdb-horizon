/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// the _lineplotter function extracted from dygraphs-combined-dev.js, available for use in conjunction with other per-series plotters and group plotters
var Dygraph = require("dygraphs/src/dygraph");
var DygraphCanvasRenderer = require("dygraphs/src/dygraph-canvas");
var utils = require("dygraphs/src/dygraph-utils");

function stackedAreaPlotter(e) {
    //extracting and reducing the Dygraph.stackPoints_ function
    stackPoints = function (
        points,
        cumulativeYval,
        seriesExtremes,
        fillMethod
    ) {
        var lastXval = null;
        var prevPoint = null;
        var nextPoint = null;
        var nextPointIdx = -1;

        // Find the next stackable point starting from the given index.
        var updateNextPoint = function (idx) {
            // If we've previously found a non-NaN point and haven't gone past it yet,
            // just use that.
            if (nextPointIdx >= idx) return;

            // We haven't found a non-NaN point yet or have moved past it,
            // look towards the right to find a non-NaN point.
            for (var j = idx; j < points.length; ++j) {
                // Clear out a previously-found point (if any) since it's no longer
                // valid, we shouldn't use it for interpolation anymore.
                nextPoint = null;
                if (!isNaN(points[j].yval) && points[j].yval !== null) {
                    nextPointIdx = j;
                    nextPoint = points[j];
                    break;
                }
            }
        };

        for (var i = 0; i < points.length; ++i) {
            var point = points[i];
            var xval = point.xval;
            if (cumulativeYval[xval] === undefined) {
                cumulativeYval[xval] = 0;
            }

            var actualYval = point.yval;
            if (isNaN(actualYval) || actualYval === null) {
                if (fillMethod == "none") {
                    actualYval = 0;
                } else {
                    // Interpolate/extend for stacking purposes if possible.
                    updateNextPoint(i);
                    if (prevPoint && nextPoint && fillMethod != "none") {
                        // Use linear interpolation between prevPoint and nextPoint.
                        actualYval =
                            prevPoint.yval +
                            (nextPoint.yval - prevPoint.yval) *
                                ((xval - prevPoint.xval) /
                                    (nextPoint.xval - prevPoint.xval));
                    } else if (prevPoint && fillMethod == "all") {
                        actualYval = prevPoint.yval;
                    } else if (nextPoint && fillMethod == "all") {
                        actualYval = nextPoint.yval;
                    } else {
                        actualYval = 0;
                    }
                }
            } else {
                prevPoint = point;
            }

            var stackedYval = cumulativeYval[xval];
            if (lastXval != xval) {
                // If an x-value is repeated, we ignore the duplicates.
                stackedYval += actualYval;
                cumulativeYval[xval] = stackedYval;
            }
            lastXval = xval;

            point.yval_stacked = stackedYval;

            if (stackedYval > seriesExtremes[1]) {
                seriesExtremes[1] = stackedYval;
            }
            if (stackedYval < seriesExtremes[0]) {
                seriesExtremes[0] = stackedYval;
            }
        }
    };

    // BEGIN HEADER BLOCK
    // This first block can be copied to other plotters to capture the group
    var g = e.dygraph;

    var group;
    var firstAreaSeriesIndex = -1;
    var groupIdx = [];
    var sets = [];
    var allSets = e.allSeriesPoints;
    var minIdx = Infinity;
    var setName = e.setName;
    var setNames = g.getLabels().slice(1);
    var groupSetNames = [];
    var fillColors = [];
    var strokeColors = g.getColors();
    // this next one we use further down, but will be populated in a decreasing loop,
    // so we'll establish the size in this forward loop so it has the structure to accept
    // later on.
    var seriesExtremes = [];
    // if (e.seriesIndex !== 0) return;

    var currGroup = g.attr_("group", setName);

    for (var setIdx = 0; setIdx < allSets.length; setIdx++) {
        // get the name and group of the current setIdx
        setName = setNames[setIdx];
        group = g.attr_("group", setName);

        if (group === currGroup) {
            firstAreaSeriesIndex =
                firstAreaSeriesIndex === -1 ? setIdx : firstAreaSeriesIndex;
            //save the indv index and the points
            groupIdx.push(setIdx);
            sets.push(allSets[setIdx]);
            groupSetNames.push(setName);
            fillColors.push(strokeColors[setIdx]);

            // the aforementioned stuff for later on
            var tmpExtremes = [];
            tmpExtremes[0] = Infinity;
            tmpExtremes[1] = -Infinity;

            seriesExtremes.push(tmpExtremes);

            // capturing the min indx helps to ensure we don't render the plotter
            // multiple times
            if (setIdx < minIdx) minIdx = setIdx;
        }
    }

    if (e.seriesIndex !== firstAreaSeriesIndex) {
        return;
    }
    // END HEADER BLOCK

    //Stack the points
    // set up cumulative records
    var cumulativeYval = [];
    var packed = g.gatherDatasets_(g.rolledSeries_, null);
    var extremes = packed.extremes;
    var seriesName;
    var points;

    for (var j = sets.length - 1; j >= 0; j--) {
        points = sets[j];
        seriesName = groupSetNames[j];

        //  stack the data
        stackPoints(
            points,
            cumulativeYval,
            seriesExtremes[j],
            g.getBooleanOption("stackedGraphNaNFill")
        );

        extremes[seriesName] = seriesExtremes[j];
    }

    // Helper function to trace a line back along the baseline.
    var traceBackPath = function (ctx, baselineX, baselineY, pathBack) {
        ctx.lineTo(baselineX, baselineY);
        for (var i = pathBack.length - 1; i >= 0; i--) {
            var pt = pathBack[i];
            ctx.lineTo(pt[0], pt[1]);
        }
    };

    // Do the actual plotting.
    // First, we'll plot the line for this series, then...
    // Second, we'll add the fills
    // In contrast to stackedlinegroup, we do this in reverse
    // order to align with the fillplotter
    var area = e.plotArea;
    var fillAlpha = g.getNumericOption("fillAlpha");

    var baseline = {};
    var currBaseline;
    var prevStepPlot; // for different line drawing modes (line/step) per series

    var ctx = e.drawingContext;

    // For filled charts, we draw points from left to right, then back along
    // the x-axis to complete a shape for filling.
    // For stacked plots, this "back path" is a more complex shape. This array
    // stores the [x, y] values needed to trace that shape.
    var pathBack = [];

    //We'll save the group indices of the current set,
    // so as to test later and hopefully skip
    // past needless iterations of the loops

    for (var j = sets.length - 1; j >= 0; j--) {
        setName = groupSetNames[j];
        e.setName = setName;

        var connectSeparated = g.getOption("connectSeparatedPoints", setName);
        var logscale = g.attributes_.getForSeries("logscale", setName);

        axis = g.axisPropertiesForSeries(setName);

        points = sets[j];

        for (var i = 0; i < points.length; i++) {
            var point = points[i];

            var yval = point.yval;

            point.y_stacked = DygraphLayoutCalcYNormal_(
                axis,
                point.yval_stacked,
                logscale
            );

            if (yval !== null && !isNaN(yval)) {
                yval = point.yval_stacked;
            }
            if (yval === null) {
                yval = NaN;
                if (!connectSeparated) {
                    point.yval = NaN;
                }
            }
            point.y = DygraphLayoutCalcYNormal_(axis, yval, logscale);

            point.canvasx = g.plotter_.area.w * point.x + g.plotter_.area.x;
            point.canvasy = g.plotter_.area.h * point.y + g.plotter_.area.y;
        }
        // g.user_attrs_.observer.next(1234);

        //BEGIN THE FILL
        var stepPlot = g.getBooleanOption("stepPlot", setName);
        var color = g.getOption("color", setName);
        var axis = g.axisPropertiesForSeries(setName);
        var axisY = 1.0 + axis.minyval * axis.yscale;
        if (axisY < 0.0) axisY = 0.0;
        else if (axisY > 1.0) axisY = 1.0;
        axisY = area.h * axisY + area.y;

        // setup graphics context
        var prevX = NaN;
        var prevYs = [-1, -1];
        var newYs;

        // should be same color as the lines but only 15% opaque.
        var rgb = utils.toRGB_(color);
        var err_color =
            "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + fillAlpha + ")";

        var iter = utils.createIterator(
            points,
            0,
            points.length,
            DygraphCanvasRendererGetIteratorPredicate(
                g.getBooleanOption("connectSeparatedPoints", setName)
            )
        );

        ctx.fillStyle = err_color;
        ctx.beginPath();
        var last_x,
            is_first = true;

        // If the point density is high enough, dropping segments on their way to
        // the canvas justifies the overhead of doing so.
        // if (points.length > 2 * g.width_ || Dygraph.FORCE_FAST_PROXY) {
        // ctx = DygraphCanvasRendererFastCanvasProxy_(ctx);
        // }

        // TODO(danvk): there are a lot of options at play in this loop.
        //     The logic would be much clearer if some (e.g. stackGraph and
        //     stepPlot) were split off into separate sub-plotters.
        var point;

        // Throughout this loop, we test to see if the top-level called series
        // matches the one current in the parent FOR loop.  If not, we skip
        // the parts that draw the line but leave the others so the pathback
        // and prevYs and prevXs still get properly populated
        while (iter.hasNext) {
            point = iter.next();
            if (!utils.isOK(point.y) && !stepPlot) {
                //
                if (e.setName === setName)
                    traceBackPath(ctx, prevX, prevYs[1], pathBack);
                pathBack = [];
                prevX = NaN;
                if (point.y_stacked !== null && !isNaN(point.y_stacked)) {
                    baseline[point.canvasx] = area.h * point.y_stacked + area.y;
                }
                continue;
            }
            if (!is_first && last_x == point.xval) {
                continue;
            } else {
                is_first = false;
                last_x = point.xval;
            }

            currBaseline = baseline[point.canvasx];
            var lastY;
            if (currBaseline === undefined) {
                lastY = axisY;
            } else {
                if (prevStepPlot) {
                    lastY = currBaseline[0];
                } else {
                    lastY = currBaseline;
                }
            }
            newYs = [point.canvasy, lastY];

            if (stepPlot) {
                // Step plots must keep track of the top and bottom of
                // the baseline at each point.
                if (prevYs[0] === -1) {
                    baseline[point.canvasx] = [point.canvasy, axisY];
                } else {
                    baseline[point.canvasx] = [point.canvasy, prevYs[0]];
                }
            } else {
                baseline[point.canvasx] = point.canvasy;
            }

            if (!isNaN(prevX)) {
                if (e.setName === setName) {
                    // Move to top fill point
                    if (stepPlot) {
                        ctx.lineTo(point.canvasx, prevYs[0]);
                        ctx.lineTo(point.canvasx, newYs[0]);
                    } else {
                        ctx.lineTo(point.canvasx, newYs[0]);
                    }
                }

                // Record the baseline for the reverse path.
                pathBack.push([prevX, prevYs[1]]);
                if (prevStepPlot && currBaseline) {
                    // Draw to the bottom of the baseline
                    pathBack.push([point.canvasx, currBaseline[1]]);
                } else {
                    pathBack.push([point.canvasx, newYs[1]]);
                }
            } else if (e.setName === setName) {
                ctx.moveTo(point.canvasx, newYs[1]);
                ctx.lineTo(point.canvasx, newYs[0]);
            }
            prevYs = newYs;
            prevX = point.canvasx;
        }
        prevStepPlot = stepPlot;
        if (newYs && point) {
            if (e.setName === setName)
                traceBackPath(ctx, point.canvasx, newYs[1], pathBack);
            pathBack = [];
        }
        ctx.fill();
    }

    for (var j = 0; j < sets.length; j++) {
        setName = groupSetNames[j];
        points = sets[j];
        e.points = points;

        var strokeWidth = e.strokeWidth;

        var borderWidth = g.getNumericOption("strokeBorderWidth", setName);
        var drawPointCallback =
            g.getOption("drawPointCallback", setName) || utils.Circles.DEFAULT;
        var strokePattern = g.getOption("strokePattern", setName);
        var drawPoints = g.getBooleanOption("drawPoints", setName);
        var pointSize = g.getNumericOption("pointSize", setName);

        if (borderWidth && strokeWidth) {
            DygraphCanvasRendererDrawStyledLine(
                e,
                g.getOption("strokeBorderColor", setName),
                strokeWidth + 2 * borderWidth,
                strokePattern,
                drawPoints,
                drawPointCallback,
                pointSize
            );
        }
        DygraphCanvasRendererDrawStyledLine(
            e,
            g.getOption("color", setName),
            strokeWidth,
            strokePattern,
            drawPoints,
            drawPointCallback,
            pointSize
        );
    }
}

var DygraphLayoutCalcYNormal_ = function (axis, value, logscale) {
    if (logscale) {
        var x =
            1.0 -
            (utils.log10(value) - utils.log10(axis.minyval)) * axis.ylogscale;
        return isFinite(x) ? x : NaN; // shim for v8 issue; see pull request 276
    } else {
        return 1.0 - (value - axis.minyval) * axis.yscale;
    }
};

/**
 * Returns a predicate to be used with an iterator, which will
 * iterate over points appropriately, depending on whether
 * connectSeparatedPoints is true. When it's false, the predicate will
 * skip over points with missing yVals.
 */
<<<<<<< HEAD
var DygraphCanvasRendererGetIteratorPredicate = function (
    connectSeparatedPoints
) {
=======
var DygraphCanvasRendererGetIteratorPredicate = function (connectSeparatedPoints) {
>>>>>>> d2529e5f (last commit to get angular updated to version 9)
    return connectSeparatedPoints
        ? DygraphCanvasRendererPredicateThatSkipsEmptyPoints
        : null;
};

var DygraphCanvasRendererPredicateThatSkipsEmptyPoints = function (array, idx) {
    return array[idx].yval !== null;
};

/**
 * Draws a line with the styles passed in and calls all the drawPointCallbacks.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
var DygraphCanvasRendererDrawStyledLine = function (
    e,
    color,
    strokeWidth,
    strokePattern,
    drawPoints,
    drawPointCallback,
    pointSize
) {
    var g = e.dygraph;
    // TODO(konigsberg): Compute attributes outside this method call.
    var stepPlot = g.getBooleanOption("stepPlot", e.setName);

    if (!utils.isArrayLike(strokePattern)) {
        strokePattern = null;
    }

    var drawGapPoints = g.getBooleanOption("drawGapEdgePoints", e.setName);

    var points = e.points;
    var setName = e.setName;
    var iter = utils.createIterator(
        points,
        0,
        points.length,
        DygraphCanvasRendererGetIteratorPredicate(
            g.getBooleanOption("connectSeparatedPoints", setName)
        )
    );

    var stroking = strokePattern && strokePattern.length >= 2;

    var ctx = e.drawingContext;
    ctx.save();
    if (stroking) {
        if (ctx.setLineDash) ctx.setLineDash(strokePattern);
    }

    var pointsOnLine = DygraphCanvasRendererDrawSeries(
        e,
        iter,
        strokeWidth,
        pointSize,
        drawPoints,
        drawGapPoints,
        stepPlot,
        color
    );
    DygraphCanvasRendererDrawPointsOnLine(
        e,
        pointsOnLine,
        drawPointCallback,
        color,
        pointSize
    );

    if (stroking) {
        if (ctx.setLineDash) ctx.setLineDash([]);
    }

    ctx.restore();
};

var DygraphCanvasRendererDrawPointsOnLine = function (
    e,
    pointsOnLine,
    drawPointCallback,
    color,
    pointSize
) {
    var ctx = e.drawingContext;
    for (var idx = 0; idx < pointsOnLine.length; idx++) {
        var cb = pointsOnLine[idx];
        ctx.save();
        drawPointCallback.call(
            e.dygraph,
            e.dygraph,
            e.setName,
            ctx,
            cb[0],
            cb[1],
            color,
            pointSize,
            cb[2]
        );
        ctx.restore();
    }
};

var DygraphCanvasRendererDrawSeries = function (
    e,
    iter,
    strokeWidth,
    pointSize,
    drawPoints,
    drawGapPoints,
    stepPlot,
    color
) {
    var prevCanvasX = null;
    var prevCanvasY = null;
    var nextCanvasY = null;
    var isIsolated; // true if this point is isolated (no line segments)
    var point; // the point being processed in the while loop
    var pointsOnLine = []; // Array of [canvasx, canvasy] pairs.
    var first = true; // the first cycle through the while loop

    var ctx = e.drawingContext;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    // NOTE: we break the iterator's encapsulation here for about a 25% speedup.
    var arr = iter.array_;
    var limit = iter.end_;
    var predicate = iter.predicate_;

    for (var i = iter.start_; i < limit; i++) {
        point = arr[i];
        if (predicate) {
            while (i < limit && !predicate(arr, i)) {
                i++;
            }
            if (i == limit) break;
            point = arr[i];
        }

        // FIXME: The 'canvasy != canvasy' test here catches NaN values but the test
        // doesn't catch Infinity values. Could change this to
        // !isFinite(point.canvasy), but I assume it avoids isNaN for performance?
        if (point.canvasy === null || point.canvasy != point.canvasy) {
            if (stepPlot && prevCanvasX !== null) {
                // Draw a horizontal line to the start of the missing data
                ctx.moveTo(prevCanvasX, prevCanvasY);
                ctx.lineTo(point.canvasx, prevCanvasY);
            }
            prevCanvasX = prevCanvasY = null;
        } else {
            isIsolated = false;
            if (drawGapPoints || prevCanvasX === null) {
                iter.nextIdx_ = i;
                iter.next();
                nextCanvasY = iter.hasNext ? iter.peek.canvasy : null;

                var isNextCanvasYNullOrNaN =
                    nextCanvasY === null || nextCanvasY != nextCanvasY;
                isIsolated = prevCanvasX === null && isNextCanvasYNullOrNaN;
                if (drawGapPoints) {
                    // Also consider a point to be "isolated" if it's adjacent to a
                    // null point, excluding the graph edges.
                    if (
                        (!first && prevCanvasX === null) ||
                        (iter.hasNext && isNextCanvasYNullOrNaN)
                    ) {
                        isIsolated = true;
                    }
                }
            }

            if (prevCanvasX !== null) {
                if (strokeWidth) {
                    if (stepPlot) {
                        ctx.moveTo(prevCanvasX, prevCanvasY);
                        ctx.lineTo(point.canvasx, prevCanvasY);
                    }

                    ctx.lineTo(point.canvasx, point.canvasy);
                }
            } else {
                ctx.moveTo(point.canvasx, point.canvasy);
            }
            if (drawPoints || isIsolated) {
                pointsOnLine.push([point.canvasx, point.canvasy, point.idx]);
            }
            prevCanvasX = point.canvasx;
            prevCanvasY = point.canvasy;
        }
        first = false;
    }
    ctx.stroke();
    return pointsOnLine;
};

var DygraphCanvasRendererFastCanvasProxy_ = function (context) {
    var pendingActions = []; // array of [type, x, y] tuples
    var lastRoundedX = null;
    var lastFlushedX = null;

    var LINE_TO = 1,
        MOVE_TO = 2;

    var actionCount = 0; // number of moveTos and lineTos passed to context.

    // Drop superfluous motions
    // Assumes all pendingActions have the same (rounded) x-value.
    var compressActions = function (opt_losslessOnly) {
        if (pendingActions.length <= 1) return;

        // Lossless compression: drop inconsequential moveTos.
        for (var i = pendingActions.length - 1; i > 0; i--) {
            var action = pendingActions[i];
            if (action[0] == MOVE_TO) {
                var prevAction = pendingActions[i - 1];
                if (prevAction[1] == action[1] && prevAction[2] == action[2]) {
                    pendingActions.splice(i, 1);
                }
            }
        }

        // Lossless compression: ... drop consecutive moveTos ...
        for (
            var i = 0;
            i < pendingActions.length - 1 /* incremented internally */;

        ) {
            var action = pendingActions[i];
            if (action[0] == MOVE_TO && pendingActions[i + 1][0] == MOVE_TO) {
                pendingActions.splice(i, 1);
            } else {
                i++;
            }
        }

        // Lossy compression: ... drop all but the extreme y-values ...
        if (pendingActions.length > 2 && !opt_losslessOnly) {
            // keep an initial moveTo, but drop all others.
            var startIdx = 0;
            if (pendingActions[0][0] == MOVE_TO) startIdx++;
            var minIdx = null,
                maxIdx = null;
            for (var i = startIdx; i < pendingActions.length; i++) {
                var action = pendingActions[i];
                if (action[0] != LINE_TO) continue;
                if (minIdx === null && maxIdx === null) {
                    minIdx = i;
                    maxIdx = i;
                } else {
                    var y = action[2];
                    if (y < pendingActions[minIdx][2]) {
                        minIdx = i;
                    } else if (y > pendingActions[maxIdx][2]) {
                        maxIdx = i;
                    }
                }
            }
            var minAction = pendingActions[minIdx],
                maxAction = pendingActions[maxIdx];
            pendingActions.splice(startIdx, pendingActions.length - startIdx);
            if (minIdx < maxIdx) {
                pendingActions.push(minAction);
                pendingActions.push(maxAction);
            } else if (minIdx > maxIdx) {
                pendingActions.push(maxAction);
                pendingActions.push(minAction);
            } else {
                pendingActions.push(minAction);
            }
        }
    };

    var flushActions = function (opt_noLossyCompression) {
        compressActions(opt_noLossyCompression);
        for (var i = 0, len = pendingActions.length; i < len; i++) {
            var action = pendingActions[i];
            if (action[0] == LINE_TO) {
                context.lineTo(action[1], action[2]);
            } else if (action[0] == MOVE_TO) {
                context.moveTo(action[1], action[2]);
            }
        }
        if (pendingActions.length) {
            lastFlushedX = pendingActions[pendingActions.length - 1][1];
        }
        actionCount += pendingActions.length;
        pendingActions = [];
    };

    var addAction = function (action, x, y) {
        var rx = Math.round(x);
        if (lastRoundedX === null || rx != lastRoundedX) {
            // if there are large gaps on the x-axis, it's essential to keep the
            // first and last point as well.
            var hasGapOnLeft = lastRoundedX - lastFlushedX > 1,
                hasGapOnRight = rx - lastRoundedX > 1,
                hasGap = hasGapOnLeft || hasGapOnRight;
            flushActions(hasGap);
            lastRoundedX = rx;
        }
        pendingActions.push([action, x, y]);
    };

    return {
        moveTo: function (x, y) {
            addAction(MOVE_TO, x, y);
        },
        lineTo: function (x, y) {
            addAction(LINE_TO, x, y);
        },

        // for major operations like stroke/fill, we skip compression to ensure
        // that there are no artifacts at the right edge.
        stroke: function () {
            flushActions(true);
            context.stroke();
        },
        fill: function () {
            flushActions(true);
            context.fill();
        },
        beginPath: function () {
            flushActions(true);
            context.beginPath();
        },
        closePath: function () {
            flushActions(true);
            context.closePath();
        },

        _count: function () {
            return actionCount;
        },
    };
};

module.exports = stackedAreaPlotter;
