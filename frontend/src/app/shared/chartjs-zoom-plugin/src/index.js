var Chart = require('chart.js');

Chart = typeof(Chart) === 'function' ? Chart : window.Chart;

Chart.Zoom = Chart.Zoom || {};

Chart.Zoom.defaults = {
	enabled: false,
	mode: "x|y"
};

var zoomPlugin = require('./zoom.js')(Chart);

module.exports = zoomPlugin;

Chart.pluginService.register(zoomPlugin);