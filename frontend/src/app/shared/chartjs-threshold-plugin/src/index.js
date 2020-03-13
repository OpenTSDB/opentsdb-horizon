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