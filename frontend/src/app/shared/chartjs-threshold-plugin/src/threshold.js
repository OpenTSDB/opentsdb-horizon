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
'use strict';

var ThresholdLine = require('./element.thresholdline.js');

module.exports = function(Chart) {

	var chartHelpers = Chart.helpers;
	var dragging = false;
	var selectionBorder = 2;
	var lineConfig;

	/**
     *
     * Initalizes the threshold configurations
     * @param {Object} chart - chart instance
     */
	function initialize(chart) {
		var targetCanvas = chart.ctx.canvas;

		var newCanvas = document.createElement('canvas');
		var parentDiv = targetCanvas.parentNode;
		parentDiv.appendChild(newCanvas);
		newCanvas.style.position = "absolute";
		newCanvas.style.left =   '0px';
		newCanvas.style.top =  '0px';
		newCanvas.style.zIndex = 1;
		setCursor(newCanvas, "pointer");
        chart.options.threshold = chartHelpers.configMerge(Chart.Threshold.defaults, chart.options.threshold || {} );
        chart.threshold={
				elements:{},
                overlayCanvas:newCanvas,
                firstRun:false,
                selection: null
		};
		setSize(chart);
    }

	/**
     *
     * Sets the width and height of the canvas
     * @param {Object} chart - chart instance
     */
	function setSize(chart) {
		var pixelRatio = chart.currentDevicePixelRatio || 1;
		chart.threshold.overlayCanvas.width  = chart.width * pixelRatio;
		chart.threshold.overlayCanvas.height = chart.height * pixelRatio;
		chart.threshold.overlayCanvas.getContext('2d').scale(pixelRatio, pixelRatio);
		chart.threshold.overlayCanvas.style.height = chart.height + 'px';
		chart.threshold.overlayCanvas.style.width = chart.width + 'px';
	}

	/**
     *
     * Updates the threshold configurations
     * @param {Object} chart - chart instance
     */
	function updateConfig(chart) {
        chart.options.threshold = chartHelpers.configMerge(Chart.Threshold.defaults, chart.options.threshold || {} );
		lineConfig = chart.options.threshold && chart.options.threshold.line ? chartHelpers.configMerge(Chart.Threshold.lineDefaults,chart.options.threshold.line) : Chart.Threshold.lineDefaults;
		//ctx = chart.options.threshold.draw ? chart.threshold.overlayCanvas.getContext('2d') : chart.ctx;
		chart.threshold.overlayCanvas.style.display = chart.options.threshold.draw ? "block" : "none";
        chart.threshold.selection = null;
        chart.threshold.firstRun = false;
	}

	/**
     *
     * Draws the threshold lines on the canvas
     * @param {Object} chart - chart object
     */
	function draw(chart) {
        var ctx = chart.options.threshold && chart.options.threshold.draw ? chart.threshold.overlayCanvas.getContext('2d') : chart.ctx;
        var elements = chart.threshold.elements;
		if ( chart.options.threshold.draw && chart.options.threshold.draw ) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		}
		for ( var i in elements ) {
			elements[i].draw(ctx);
		}
	}

	/**
     *
     * Sets the cursor on the element
     * @param {Object} el - element the cursor has need to set
     * @param {String} v - cursor value
     */
	function setCursor(el,v) {
		el.style.cursor = v;
	}

	/**
     *
     * Sets the border on the selected threshold line
     * @param {Object} el - threshold element
     */
	function select(chart, el) {
		clearSelection(chart);
	    chart.threshold.selection = el;
	    chart.threshold.selection.setBorder(1);
        dragging = true;
        chartHelpers.addEvent(document, 'keydown', chart.threshold._winKeyDownEventHandler);
	}

	/**
     *
     * Unselects any previously selected threshold line
     */
	function clearSelection(chart) {

		if (chart.threshold.selection) {
			chart.threshold.selection.setBorder(0);
		}

		chart.threshold.selection = null;
        dragging = false;
        chartHelpers.removeEvent(document, 'keydown', chart.threshold._winKeyDownEventHandler);
	}

	function fireEvent(chart) {
        var evt = new CustomEvent("onThresholdSet", {"detail":chart.threshold.elements});
		chart.ctx.canvas.dispatchEvent(evt);
	}

	return {

		id: 'threshold',

		afterInit: function(chart) {

			initialize(chart);

			/* handler to delete the selected threshold line */
            chart.threshold._winKeyDownEventHandler = function(e) {
				if (chart.threshold.selection && e.keyCode == 8 ) {
                    delete chart.threshold.elements[chart.threshold.selection.id];
                    clearSelection(chart);
                    draw(chart);
				}
			};

			/* 	handler to draw threshold line or
				selects/unselects the line if the line is there in the area */
              chart.threshold._mouseDownEventHandler = function(e) {
                var mx = e.offsetX;
			    var my = e.offsetY;
			    for (var i in chart.threshold.elements ) {
			      if (chart.threshold.elements[i].inRange(mx, my, selectionBorder)) {
				    select(chart,chart.threshold.elements[i]);
			        draw(chart);
			        return;
			      }
			    }

			    if (  chart.options.threshold.draw ) {
			    	if (chart.threshold.selection) {
			    		// prevents drawing a new line if the selection is made already i.e unselects the line
			    		clearSelection(chart);
			    	} else if ( Object.keys(chart.threshold.elements).length<chart.options.threshold.maxLines ) {
			    		var id = 'line-'+ new Date().getTime();
				    	var options =	{
				    						id : id,
				    						scaleId : chart.options.threshold.scaleId,
				    						value:chart.scales[chart.options.threshold.scaleId].getValueForPixel(e.offsetY)
				    					};
						chart.threshold.elements[id] = new ThresholdLine(chart, chartHelpers.configMerge(Chart.Threshold.lineDefaults,options));
                        fireEvent(chart);

                    }
                    draw(chart);
			    }
  			};


			/*
				handler for dragging the selected line  or
				sets the move cursor if the line is already there or
				set the pointer if no line is drawn in that area
			*/
            chart.threshold._mouseMoveEventHandler = function(e) {
				if (dragging){
					if (e.offsetY <= chart.chartArea.bottom && e.offsetY >= chart.chartArea.top) {
 						chart.threshold.selection.value = chart.scales[chart.threshold.selection.scaleId].getValueForPixel(e.offsetY) ;
 						chart.threshold.selection.update();
						draw(chart);
					}
				} else {
			    	var mx = e.offsetX;
			    	var my = e.offsetY;
					for (var i in chart.threshold.elements ) {
				      if (chart.threshold.elements[i].inRange(mx, my,selectionBorder)) {
				        setCursor(chart.threshold.overlayCanvas, "move");
				        return;
				      }
				    }
				    setCursor(chart.threshold.overlayCanvas, "pointer");
				}
			};

			// fires a new event when new threshold line is set
			chart.threshold._mouseUpEventHandler = function(e) {
				if ( dragging ) {
					dragging = false;
        			fireEvent(chart);
        		}
			};


			chartHelpers.addEvent(chart.threshold.overlayCanvas, 'mousedown', chart.threshold._mouseDownEventHandler);
			chartHelpers.addEvent(chart.threshold.overlayCanvas,'mousemove', chart.threshold._mouseMoveEventHandler);
			chartHelpers.addEvent(chart.threshold.overlayCanvas,'mouseup', chart.threshold._mouseUpEventHandler);
		},

		afterScaleUpdate: function(chart) {
			for ( var i in chart.threshold.elements ) {
				chart.threshold.elements[i].update();
			}
		},

		afterUpdate: function(chart) {
            //unselects any previousely selected lines. this is required when we switch from edit mode
			clearSelection(chart);
            updateConfig(chart);
			if ( chart.options.threshold && chart.options.threshold.thresholds && !chart.threshold.firstRun ) {
                chart.threshold.elements = {};
				var thresholds = chart.options.threshold.thresholds;
				var width = chart.chartArea.right - chart.chartArea.left;
				for (var i=0, len=thresholds.length; i<len; i++ ) {
					var id =  thresholds[i].id || 'line-'+ i;
					if ( !chart.threshold.elements[id] ) {
						thresholds[i].id = id;
						chart.threshold.elements[id] = new ThresholdLine(chart,chartHelpers.configMerge(lineConfig,thresholds[i]));
					} else {
                        chart.threshold.elements[id] = new ThresholdLine(chart,chartHelpers.configMerge(lineConfig,thresholds[i]));
                    }
				}
				chart.threshold.firstRun = true;
            }
		},

		afterDraw: function(chart) {
			/* draws the threshold lines */
			draw(chart);
		},

		resize: function(chart) {
			setSize(chart);
		},

		destroy: function(chart) {
			chartHelpers.removeEvent(document, 'keydown', chart.threshold._winKeyDownEventHandler);
			chartHelpers.removeEvent(chart.threshold.overlayCanvas, 'mousedown', chart.threshold._mouseDownEventHandler);
			chartHelpers.removeEvent(chart.threshold.overlayCanvas,'mousemove', chart.threshold._mouseMoveEventHandler);
			chartHelpers.removeEvent(chart.threshold.overlayCanvas,'mouseup', chart.threshold._mouseUpEventHandler);
			delete chart.threshold;
		}

	};
};
