'use strict';

module.exports = function(Chart) {

	var chartHelpers = Chart.helpers;
	var dragging = false;
	var dragStartX, dragStartY, dragEndX, dragEndY;
	var zoomDir = "x";
	var zoomOptions;
	var zoomFunctions = {};

	/**
     *
     * Initalizes the zoom configurations 
     * @param {Object} chart - chart instance
     */
	function initialize(chart) {

	    zoomOptions = chartHelpers.configMerge(Chart.Zoom.defaults,chart.options.zoom);

		if ( zoomOptions.enabled ) {
			chart.zoom = {};
			var targetCanvas = chart.ctx.canvas;
			chart.zoom.newLayer = document.createElement('canvas');
			var parentDiv = targetCanvas.parentNode;
			chart.zoom.newLayer.style.position = "absolute";
			chart.zoom.newLayer.style.left =   '0px';
			chart.zoom.newLayer.style.top =  '0px';
            chart.zoom.newLayer.style.zIndex = 1;
            chart.zoom.newLayer.style.visibility = 'hidden';
			parentDiv.appendChild(chart.zoom.newLayer);
			chart.zoom.newLayer.style.cursor = "crosshair";
			targetCanvas.style.cursor = "crosshair";
			setSize(chart);

			zoomFunctions.category = zoomIndexScale;
			zoomFunctions.time = zoomTimeScale;
			zoomFunctions.linear = zoomNumericScale;
			zoomFunctions.logarithmic = zoomNumericScale;
		}
	}

	function setSize(chart) {
		var pixelRatio = chart.currentDevicePixelRatio || 1;
		chart.zoom.newLayer.width  = chart.width * pixelRatio;     
		chart.zoom.newLayer.height = chart.height * pixelRatio;
		chart.zoom.newLayer.getContext('2d').scale(pixelRatio, pixelRatio);
		chart.zoom.newLayer.style.width = chart.width + 'px';
		chart.zoom.newLayer.style.height = chart.height + 'px';		
	}

	/**
     *
     * Zoom handler for Time Scale
     * @param {Object} scale - scale object
     * @param {Integer} start - start position
     * @param {Integer} end - end position
     */
	function zoomTimeScale(scale, start, end) {
		var min = scale.getValueForPixel(start);
		var max= scale.getValueForPixel(end);
		scale.options.time.min = max.valueOf();
		scale.options.time.max = min.valueOf();
	}

	/**
     *
     * Zoom handler for Numeric Scale
     * @param {Object} scale - scale object
     * @param {Integer} start - start position
     * @param {Integer} end - end position
     */
	function zoomNumericScale(scale, start, end) {
		var range = scale.max - scale.min;
		var max = scale.getValueForPixel(start);
		var min= scale.getValueForPixel(end);
		scale.options.ticks.min = min;
		scale.options.ticks.max = max;
	}

	/**
     *
     * Zoom handler for Index Scale
     * @param {Object} scale - scale object
     * @param {Integer} start - start position
     * @param {Integer} end - end position
     */
	function zoomIndexScale(scale, start, end) {
		var labels = scale.chart.data.labels;
		var minIndex = scale.getValueForPixel(start);
		var maxIndex = scale.getValueForPixel(end);
		scale.options.ticks.min = labels[minIndex];
		scale.options.ticks.max = labels[maxIndex];
	}


	/**
     *
     * zoom handler
     * @param {Object} chart - chart instance
     */
	function doZoom(chart) {
		for (var i in chart.scales ) {
			var scale = chart.scales[i];
			var fn = zoomFunctions[scale.options.type];
			var startPixel, endPixel;
			if ( zoomDir.indexOf("x") !== -1 && scale.isHorizontal() ) {
				startPixel = Math.min(dragStartX,dragEndX);
				endPixel = Math.max(dragStartX,dragEndX);
				if (fn) {
					fn( scale, startPixel, endPixel );
				}

			} else if ( zoomDir.indexOf("y") !== -1 && !scale.isHorizontal() ) {
				startPixel = Math.min(dragStartY,dragEndY);
				endPixel = Math.max(dragStartY,dragEndY);
				if (fn) {
					fn(scale, startPixel, endPixel);
				}
			}
		}
		chart.update();
		clear(chart);
	}

	/**
     *
     * Draws the zoom area i.e rectancle
     * @param {Object} chart - chart object
     * @param {Number} x - x-axis position 
     * @param {Number} y - y-axis position
     * @param {Number} w - width of the rectancle
     * @param {Number} h - height of the rectancle
     */
	function draw(chart,x,y,w,h) {
		var ctx = chart.zoom.newLayer.getContext('2d');
		clear(chart);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth=1;
        ctx.setLineDash([]);
        ctx.fillRect(x, y,w,h );
        ctx.closePath();
        ctx.restore();
	}
	
	/**
     *
     * Clears the new canvas layer
     */
	function clear(chart) {
		var ctx = chart.zoom.newLayer.getContext('2d');
		ctx.clearRect(0, 0, chart.zoom.newLayer.width, chart.zoom.newLayer.height);
	}

	/**
     *
     * Checks x,y position is within the chart area
     * @param {Number} x - x-axis position 
     * @param {Number} y - y-axis position
     * @param {Object} chart - chart instance
     */
	function inRange(x, y, chart) {
		return 	x >= chart.chartArea.left && 
				x <= chart.chartArea.right && 
				y <= chart.chartArea.bottom && 
				y >= chart.chartArea.top;
	}

	return {

		id: 'zoom',
		afterInit: function(chart) {
			initialize(chart);
			if ( zoomOptions.enabled ) {
				var timeout;
				
				chartHelpers.each(chart.scales, function(scale) {
					scale.originalOptions = JSON.parse(JSON.stringify(scale.options));
				});
				
				chart.resetZoom = function() {
					chartHelpers.each(chart.scales, function(scale, id) {
						var timeOptions = scale.options.time;
						var tickOptions = scale.options.ticks;

						if (timeOptions) {
							delete timeOptions.min;
							delete timeOptions.max;
						}

						if (tickOptions) {
							delete tickOptions.min;
							delete tickOptions.max;
						}

						scale.options = chartHelpers.configMerge(scale.options, scale.originalOptions);
					});

					chartHelpers.each(chart.data.datasets, function(dataset, id) {
						dataset._meta = null;
					});

					chart.update(0);
				};

				chart.zoom._mouseDownHandler = function(e) {
					if ( e.type == 'mousedown' ) {
						if ( inRange(e.offsetX,e.offsetY, chart) ) {
						    dragStartX = e.offsetX;
						    dragStartY = e.offsetY;
                            dragging = true;
                            chartHelpers.addEvent(document,'mousemove', chart.zoom._mouseMoveHandler);
				            chartHelpers.addEvent(document,'mouseup', chart.zoom._mouseUpHandler);							
						}
					}
				};

				chart.zoom._doubleClickHandler = function(e) {
					dragging = false;
                    chart.zoom.newLayer.style.visibility = 'hidden';
                    chart.resetZoom();
				};

				chart.zoom._mouseUpHandler = function(e) {
					dragEndX = e.offsetX-chart.ctx.canvas.offsetLeft;
					dragEndY = e.offsetY-chart.ctx.canvas.offsetTop;
					var distance = Math.abs(dragEndX-dragStartX);
					if ( dragging && distance > 0 ) {
						doZoom(chart);
					}
					dragging = false;
                    chart.zoom.newLayer.style.visibility = 'hidden';
                    
                    chartHelpers.removeEvent(document,'mousemove', chart.zoom._mouseMoveHandler);
				    chartHelpers.removeEvent(document,'mouseup', chart.zoom._mouseUpHandler);
				};

				chart.zoom._mouseMoveHandler = function(e) {
                    chart.zoom.newLayer.style.visibility = 'visible';
					if (dragging){
						var offsetX = e.offsetX - chart.ctx.canvas.offsetLeft;
						var offsetY = e.offsetY - chart.ctx.canvas.offsetTop;
						var xDelta=Math.abs( offsetX - dragStartX );
						var yDelta=Math.abs( offsetY - dragStartY );
						var h,w,x,y,xDir = false;
						if (inRange(offsetX,offsetY,chart)) {
							if (zoomOptions.mode == "xy") {
								zoomDir = "xy";
								x = Math.min(dragStartX, offsetX);
								y = Math.min(dragStartY,offsetY);
								w = xDelta;
								h = yDelta;
							} else if ( zoomOptions.mode=="x" || zoomOptions.mode=="x|y" && xDelta > yDelta ) {
								zoomDir = "x";
								x = Math.min(dragStartX,offsetX);
								y = chart.chartArea.top; 
								h = Math.abs(chart.chartArea.bottom-chart.chartArea.top); 
								w = Math.abs(offsetX - dragStartX);
							} else if ( zoomOptions.mode=="y" || zoomOptions.mode=="x|y" && xDelta <= yDelta ) {
								zoomDir = "y";
								x = chart.chartArea.left;
								y = Math.min(dragStartY,offsetY);
								w = chart.chartArea.right - chart.chartArea.left;
								h = Math.abs(offsetY-dragStartY);
							}
							draw(chart,x + chart.ctx.canvas.offsetLeft, y + chart.ctx.canvas.offsetTop, w, h, chart.ctx);
						}
					}
				};

				chartHelpers.addEvent(chart.ctx.canvas, 'mousedown', chart.zoom._mouseDownHandler);
                chart.ctx.canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
				chartHelpers.addEvent(chart.ctx.canvas, 'dblclick', chart.zoom._doubleClickHandler);
			}
		},
		resize: function(chart) {
			if ( zoomOptions.enabled ) {
				setSize(chart);
			}
		},
		destroy: function(chart) {
			if ( zoomOptions.enabled ) {
				chartHelpers.removeEvent(chart.ctx.canvas, 'mousedown', chart.zoom._mouseDownHandler);
                chartHelpers.removeEvent(chart.ctx.canvas, 'dblclick', chart.zoom._doubleClickHandler);
                chart.ctx.canvas.removeEventListener('selectstart', chart.zoom._selectStartHandler);
				delete chart.zoom;
			}
		}

	};
};

