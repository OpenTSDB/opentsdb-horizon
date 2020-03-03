//import Dygraph from 'dygraphs';

var Thresholds = (function() {
'use strict';

 //var Thresholds = (function() {

var Thresholds= function() {
    this.thresholds = []; 
    //console.log("yahooo", this.thresholds);
    //this.thresholds = thresholds;
    //console.log("comes here... threshollllll", this.thresholds)
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