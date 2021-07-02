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
var Dygraph = require("dygraphs/src/dygraph");
var utils = require("dygraphs/src/dygraph-utils");
var DygraphInteraction = require('dygraphs/src-es5/dygraph-interaction-model');

/**
 * Overriding the default zoom behavior since we wanted more granular data
 *
 * @param {Event} event the event object which led to the endZoom call.
 * @param {Dygraph} g The dygraph on which to end the zoom.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.endZoom = function (event, g, context) {
    g.clearZoomRect_();
    context.isZooming = false;
    DygraphInteraction.maybeTreatMouseOpAsClick(event, g, context);
  
    // The zoom rectangle is visibly clipped to the plot area, so its behavior
    // should be as well.
    // See http://code.google.com/p/dygraphs/issues/detail?id=280
    var plotArea = g.getArea();
    if (context.regionWidth >= 10 && context.dragDirection == utils.HORIZONTAL) {
        var left = Math.min(context.dragStartX, context.dragEndX),
            right = Math.max(context.dragStartX, context.dragEndX);
        left = Math.max(left, plotArea.x);
        right = Math.min(right, plotArea.x + plotArea.w);
        if (left < right) {
            var minDate = g.toDataXCoord(left);
            var maxDate = g.toDataXCoord(right);
            const zoomCallback = g.getFunctionOption('zoomCallback');
            if (zoomCallback) {
                zoomCallback.call(g, minDate, maxDate, null);
            }
        }
        context.cancelNextDblclick = true;
      } else if (context.regionHeight >= 10 && context.dragDirection == utils.VERTICAL) {
      var top = Math.min(context.dragStartY, context.dragEndY),
          bottom = Math.max(context.dragStartY, context.dragEndY);
      top = Math.max(top, plotArea.y);
      bottom = Math.min(bottom, plotArea.y + plotArea.h);
      if (top < bottom) {
        g.doZoomY_(top, bottom);
      }
      context.cancelNextDblclick = true;
    }
    context.dragStartX = null;
    context.dragStartY = null;
  };

module.exports = DygraphInteraction;