(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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
    this.x1 = Math.round(chart.chartArea.left);
    this.y1 = chart.scales[this.scaleId].getPixelForValue(this.value) + d;
    this.x2 = this.x1 + Math.round(chart.chartArea.right - chart.chartArea.left);
    this.y2 = this.y1;
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
},{}],3:[function(require,module,exports){
var Chart = require('chart.js');

Chart = typeof(Chart) === 'function' ? Chart : window.Chart;

Chart.Threshold = Chart.Threshold || {};

Chart.Threshold.defaults = {
	draw: false,
    maxLines: Number.MAX_VALUE,
    scaleId : 'y-axis-0',
	thresholds : []
};

Chart.Threshold.lineDefaults = {
	borderColor: '#000000',
	borderWidth: 1,
	borderDash: [],
	borderDashOffset: 0
};

var thresholdPlugin = require('./threshold.js')(Chart);


module.exports = thresholdPlugin;

Chart.pluginService.register(thresholdPlugin);
},{"./threshold.js":4,"chart.js":1}],4:[function(require,module,exports){
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
        alert("coems here..");
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
        // console.log(chart.options.threshold, "instance options..")
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
		//maxLines = chart.options.threshold && chart.options.threshold.maxLines || Number.MAX_VALUE;
		//editMode = chart.options.threshold && chart.options.threshold.draw || false;
        //scaleId = chart.options.threshold && chart.options.threshold.scaleId || "y-axis-0";
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
        var ctx = chart.options.threshold.draw ? chart.threshold.overlayCanvas.getContext('2d') : chart.ctx;
        var elements = chart.threshold.elements;
        // console.log("elements", elements);
		if ( chart.options.threshold.draw ) {
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
        // console.log("send events..", chart.threshold.elements);
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
                    // console.log(chart, "coimes ......", chart.threshold.selection, chart.threshold.elements);
					delete chart.threshold.elements[chart.threshold.selection.id];
                    clearSelection(chart);
                    // console.log(chart.threshold.elements)
					draw(chart);
				}				
			};

			/* 	handler to draw threshold line or 
				selects/unselects the line if the line is there in the area */
              chart.threshold._mouseDownEventHandler = function(e) {
                // console.log("mouse down..")
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
                    // console.log(chart.threshold.elements, "added..");
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
				var thresholds = chart.options.threshold.thresholds;
				var width = chart.chartArea.right - chart.chartArea.left;
				for (var i=0, len=thresholds.length; i<len; i++ ) {
					var id =  thresholds[i].id || 'line-'+ new Date().getTime();
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

},{"./element.thresholdline.js":2}]},{},[3]);
