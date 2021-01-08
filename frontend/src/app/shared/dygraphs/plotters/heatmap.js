var d3 = require("d3");

var heatmapPlotter = function (e) {
  if (e.seriesIndex !== 0) return;
  var ctx = e.drawingContext;
  var allSeriesPoints = e.allSeriesPoints;
  var points = e.points;
  var plotArea = e.plotArea;
  var config = e.dygraph.user_attrs_.heatmap;
  var bucketHeight =  plotArea.h / config.buckets;

  const y = d3.scaleLinear()
                .domain(e.axis.valueRange)
                .range([0, config.buckets]);

  const opacity = d3.scaleLinear()
                      .domain([0, config.bucketValues.length-1])
                      .range([0.1, 1]);
  const color = config.color || '#000000';
  let colors = null, r, g, b, singleColor = true;
  if ( Array.isArray(color) ) {
    const minN = config.bucketValues.length ? config.bucketValues[0] : 0;
    const maxN = config.bucketValues.length ? config.bucketValues[config.bucketValues.length - 1] : 1;
    // colors = d3.scaleSequential(d3.interpolate(...config.color)).domain([ minN, maxN]);
    const domain = [ minN, maxN ];
    if ( color.length > 2 ) {
      domain.splice(1, 0, maxN / 2 );
    }
    colors = d3.scaleLinear()
              .domain(domain)
              .range(config.color);
    singleColor = false;
  } else {
    r = parseInt(color.substring(1, 3), 16);
    g = parseInt(color.substring(3, 5), 16);
    b = parseInt(color.substring(5, 7), 16);
  }

  config.colorValueMap = {};
  // bucket value : rank { bucket value : index, ..}
  var rank = {};
  for ( var i = 0; i < config.bucketValues.length; i++ ) {
    const v = config.bucketValues[i];
    rank[v] = i;
    config.colorValueMap[v] = singleColor ? 'rgba(' + r + ',' +  g + ',' + b + ',' + (v === config.nseries  ? 1: opacity(rank[v])) +')' : colors(v);
  }
    
  

  // Find the minimum separation between x-values.
  var width = Infinity;
  for (var i = 1; i < points.length; i++) {
      width = points[i].canvasx - points[i - 1].canvasx;
    // if (sep < min_sep) min_sep = sep;
  }

  // Do the actual plotting.
  for (var i = 0; i < allSeriesPoints.length; i++) {
    for ( var j = 0; j < allSeriesPoints[i].length; j++ ) {
      var point = allSeriesPoints[i][j];
      if ( !isNaN(point.y) ) {
        //ctx.strokeWidth = 1;
        ctx.fillStyle = config.colorValueMap[point.yval];
        ctx.fillRect( point.canvasx - width/2, e.dygraph.toDomYCoord(y.invert(parseInt(point.name))),width, bucketHeight);

        //ctx.stroke();
      }
    }
  }
};

module.exports = heatmapPlotter;