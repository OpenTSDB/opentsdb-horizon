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
// borrowed from Dygraphs for RStudio
// https://github.com/rstudio/dygraphs/blob/master/inst/plotters/stackedbarchart.js
"use strict";
var Dygraph = require("dygraphs/src/dygraph");
var DygraphLayout = require("dygraphs/src/dygraph-layout");

var barChartPlotter = function (e) {
    // We need to handle all the series simultaneously.
    var g = e.dygraph;

    var sets = e.allSeriesPoints;
    var ctx = e.drawingContext;
    var y_bottom = e.dygraph.toDomYCoord(0);

    //extracting and reducing the Dygraph.stackPoints_ function
    function stackPoints(points, cumulativeYval, fillMethod) {
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
                cumulativeYval[xval] = { positive: 0, negative: 0 };
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

            var direction = actualYval >= 0 ? "positive" : "negative";
            var stackedYval = cumulativeYval[xval][direction];
            if (lastXval != xval) {
                // If an x-value is repeated, we ignore the duplicates.
                stackedYval += actualYval;
                cumulativeYval[xval][direction] = stackedYval;
            }
            lastXval = xval;

            point.yval_stacked = stackedYval;
        }
    }

    var setNames = g.getLabels().slice(1); // remove x-axis

    var points = e.points;
    var sets = e.allSeriesPoints;
    var minIdx = Infinity;

    var fillColors = [];
    var strokeColors = g.getColors();
    for (var i = 0; i < strokeColors.length; i++) {
        fillColors.push(strokeColors[i]);
    }

    // figure out which series are configured to use
    // barCharts. ignore the rest.
    //e.dygraph.user_attrs_.series[].plotter.name;
    var seriesInfo = g.user_attrs_.series;
    var barChartSeries = {};
    var firstSeriesIndex = -1;
    for (var i in seriesInfo) {
        if (
            seriesInfo[i].plotter !== undefined &&
            seriesInfo[i].plotter === barChartPlotter
        ) {
            barChartSeries[i - 1] = i;
            if (firstSeriesIndex === -1) {
                firstSeriesIndex = i - 1;
            }
        }
    }

    if (e.seriesIndex !== firstSeriesIndex) {
        return;
    }
    // Find the minimum separation between x-values.
    // This determines the bar width.
    var points = sets[0];

    var min_sep = Infinity;
    for (var i = 1; i < points.length; i++) {
        var sep = points[i].canvasx - points[i - 1].canvasx;
        if (sep < min_sep) min_sep = sep;
    }
    var bar_width = Math.floor((2.0 / 3) * min_sep);

    // set up cumulative records
    var cumulativeYval = [];
    var packed = g.gatherDatasets_(g.rolledSeries_, null);
    var seriesName;

    for (var j = sets.length - 1; j >= 0; j--) {
        if (!barChartSeries[j]) continue;

        points = sets[j];
        seriesName = setNames[j];

        //  stack the data
        stackPoints(
            points,
            cumulativeYval,
            g.getBooleanOption("stackedGraphNaNFill")
        );
    }

    var axis;
    var logscale;
    var connectSeparated;

    // Do the actual plotting.
    for (var j = 0; j < sets.length; j++) {
        if (!barChartSeries[j]) continue;

        seriesName = setNames[j];
        connectSeparated = g.getOption("connectSeparatedPoints", seriesName);
        logscale = g.attributes_.getForSeries("logscale", seriesName);
        var color = g.getOption("color", seriesName);

        var seriesProp = g.getPropertiesForSeries(seriesName);
        y_bottom = e.dygraph.toDomYCoord(logscale ? 1 : 0, seriesProp.axis - 1);

        axis = g.axisPropertiesForSeries(seriesName);
        points = sets[j];
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            if (isNaN(point.yval) || point.yval === null) {
                continue;
            }

            point.y_stacked = DygraphLayoutCalcYNormal_(
                axis,
                point.yval_stacked,
                logscale
            );

            point.y = point.y_stacked;
            point.canvasx = g.plotter_.area.w * point.x + g.plotter_.area.x;
            point.canvasy = g.plotter_.area.h * point.y + g.plotter_.area.y;
            var center_x = point.canvasx;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;

            ctx.fillRect(
                center_x - bar_width / 2,
                point.canvasy,
                bar_width,
                y_bottom - point.canvasy
            );

            ctx.strokeRect(
                center_x - bar_width / 2,
                point.canvasy,
                bar_width,
                y_bottom - point.canvasy
            );
        }
    }
};

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

module.exports = barChartPlotter;
