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
var multiColumnBarPlotter = function (e) {
    // We need to handle all the series simultaneously.
    if (e.seriesIndex !== 0) return;

    var g = e.dygraph;
    var ctx = e.drawingContext;
    var sets = e.allSeriesPoints;
    var y_bottom = e.dygraph.toDomYCoord(0);

    // Find the minimum separation between x-values.
    // This determines the bar width.
    var min_sep = Infinity;
    for (var j = 0; j < sets.length; j++) {
        var points = sets[j];
        for (var i = 1; i < points.length; i++) {
            var sep = points[i].canvasx - points[i - 1].canvasx;
            if (sep < min_sep) min_sep = sep;
        }
    }
    var bar_width = Math.floor((2.0 / 3) * min_sep);

    var fillColors = [];
    var strokeColors = g.getColors();
    for (var i = 0; i < strokeColors.length; i++) {
        fillColors.push(darkenColor(strokeColors[i]));
    }

    for (var j = 0; j < sets.length; j++) {
        ctx.fillStyle = fillColors[j];
        ctx.strokeStyle = strokeColors[j];
        for (var i = 0; i < sets[j].length; i++) {
            var p = sets[j][i];
            var center_x = p.canvasx;
            var x_left =
                center_x - (bar_width / 2) * (1 - j / (sets.length - 1));

            ctx.fillRect(
                x_left,
                p.canvasy,
                bar_width / sets.length,
                y_bottom - p.canvasy
            );

            ctx.strokeRect(
                x_left,
                p.canvasy,
                bar_width / sets.length,
                y_bottom - p.canvasy
            );
        }
    }
};

module.exports = multiColumnBarPlotter;
