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
function ThresholdLine(chart,options) {
    this.id = options.id;
    this.value = options.value;
    this.scaleId = options.scaleId;
	this.chart = chart;
    this.options = options;
    this.update();
}

/**
 *
 * Updates the line configurations 
 */
ThresholdLine.prototype.update = function() {
    var chart = this.chart;
    // subtracts 0.5 from x-axis position if the lineWidth is odd number
    var lineWidth = this.options.borderWidth || 1;
    var d = lineWidth % 2 == 1 ? 0.5 : 0;
    if ( chart.config.type === 'bar' ) {
        this.x1 = Math.round(chart.chartArea.left);
        this.y1 = chart.scales[this.scaleId].getPixelForValue(this.value) + d;
        this.x2 = this.x1 + Math.round(chart.chartArea.right - chart.chartArea.left);
        this.y2 = this.y1;
    } else {
        this.x1 = chart.scales[this.scaleId].getPixelForValue(this.value) + d;
        this.x2 = this.x1;
        this.y1 = Math.round(chart.chartArea.bottom);
        this.y2 = Math.round(chart.chartArea.top);
    }
};

/**
 *
 * Sets the border around the threshold line 
 * @param {Integer} border - border width
 */
ThresholdLine.prototype.setBorder = function(border) {
    this.border = border;
};

/**
 *
 * Draws the threshold line 
 * @param {Object} ctx - target canvas context
 */
ThresholdLine.prototype.draw = function(ctx) {
    // don't draw line if out of chart area
    if ( (this.chart.config.type === 'bar' && (this.y1 < this.chart.chartArea.top || this.y1 > this.chart.chartArea.bottom)) ||
            (this.chart.config.type === 'horizontalBar' && (this.x1 < this.chart.chartArea.left || this.x1 > this.chart.chartArea.right)) ) {
        return;
    }
    ctx.beginPath();

    if (ctx.setLineDash) {
        ctx.setLineDash(this.options.borderDash||[]);   
    }

    var lineWidth = this.options.borderWidth || 1;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = this.options.borderColor || "#000000";
    ctx.lineDashOffset = this.options.borderDashOffset || 0;
    ctx.moveTo(this.x1,this.y1);
    ctx.lineTo(this.x2,this.y2);
    ctx.stroke();
    ctx.closePath();

    var height = this.options.borderWidth || 1 ;
    var border = 5;
    if ( this.border ) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth=2;
        ctx.setLineDash([4,2]);
        ctx.strokeRect(this.x1, this.y1-(border+height), this.x2-this.x1, 2*( height + border));
        ctx.closePath();
        ctx.restore();
    }
};

/**
 *
 * Checks whether the mouse position falls on the line range 
 * @param {Integer} mx - mouseX position
 * @param {Integer} my - mouseY position
 * @param {Integer} around - extra surrounding area to consider 
 */
ThresholdLine.prototype.inRange = function(mx, my, around) {
  	return  (this.x1 <= mx) && (this.x2 >= mx) &&
          (this.y1 - around <= my) && (this.y1 +  around >= my);
};

module.exports = ThresholdLine;