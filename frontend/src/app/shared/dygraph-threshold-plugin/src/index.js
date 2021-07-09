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
//import Dygraph from 'dygraphs';

var Thresholds = (function() {
'use strict';

 //var Thresholds = (function() {

var Thresholds= function() {
    this.thresholds = [];
    //this.thresholds = thresholds;
  };

  Thresholds.prototype.toString = function() {
    return "Thresholds Plugin";
  };

  Thresholds.prototype.activate = function(g) {
    return {
        //clearChart: this.clearChart,
        didDrawChart: this.didDrawChart
    };
  };

  Thresholds.prototype.clearChart = function(e) {
    this.thresholds = [];
  };
  Thresholds.prototype.didDrawChart = function(e) {
    var g = e.dygraph;
    this.thresholds = g.getOption('thresholds');
    this.thresholds = this.thresholds? this.thresholds : [];

    var ctx = e.drawingContext;

    for (var i = 0; i < this.thresholds.length; i++) {
      var threshold  = this.thresholds[i];
      ctx.save();
      ctx.lineWidth = threshold.borderWidth || 1;
      ctx.strokeStyle = threshold.borderColor || "#000000";
      ctx.setLineDash(threshold.borderDash || []);
      ctx.lineDashOffset = 0;

      ctx.beginPath();
      var y = !threshold.scaleId || threshold.scaleId === 'y' ? g.toDomYCoord(threshold.value) : g.toDomYCoord(threshold.value,1);
      var a = g.getArea();
      ctx.moveTo(a.x, y);
      ctx.lineTo(a.x + a.w, y);
      ctx.stroke();
      ctx.closePath();

      // draw value
      ctx.textAlign="end";
      ctx.font = "12px Ubuntu";
      ctx.fillText(threshold.value, a.x + a.w, y-2);
      ctx.restore();
    }
  };

  return Thresholds;

})();

//export default Thresholds;
module.exports = Thresholds;
