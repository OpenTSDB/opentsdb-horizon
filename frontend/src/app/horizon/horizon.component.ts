import { Component, ViewEncapsulation, OnInit, HostBinding } from '@angular/core';
import { IDygraphOptions } from '../shared/modules/dygraphs/IDygraphOptions';

@Component({
  selector: 'horizon-chart',
  templateUrl: './horizon.component.html',
  styleUrls: ['./horizon.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HorizonComponent implements OnInit {
  @HostBinding("class.hrzn-chart") private hrznClass = true;

  constructor() { }

  options: IDygraphOptions = {
    "labels": [
        "x",
        "1",
        "2"
    ],
    "labelsUTC": false,
    "labelsKMB": true,
    "connectSeparatedPoints": true,
    "drawPoints": false,
    "logscale": false,
    "digitsAfterDecimal": 2,
    "fillAlpha": 0.55,
    "stackedGraph": false,
    "stackedGraphNaNFill": "none",
    "strokeWidth": 1,
    "strokeBorderWidth": 0,
    "highlightSeriesBackgroundAlpha": 1,
    "highlightSeriesBackgroundColor": "rgb(255,255,255)",
    "isZoomedIgnoreProgrammaticZoom": true,
    "hideOverlayOnMouseOut": true,
    "isCustomZoomed": false,
    "theme": "light",
    "highlightSeriesOpts": {
        "strokeWidth": 2,
        "highlightCircleSize": 5
    },
    "xlabel": "",
    "ylabel": "",
    "y2label": "",
    "axisLineWidth": 0,
    "axisTickSize": 0,
    "axisLineColor": "#fff",
    "axes": {
        "y": {
            "valueRange": [
                null,
                null
            ],
            "tickFormat": {
                "unit": "auto",
                "precision": "auto",
                "unitDisplay": true,
                "max": 3568458.627042899,
                "min": 20390.98419067054
            },
            "logscale": false,
            "drawAxis": true,
            "axisLabelWidth": 50,
            "axisLabelFontSize": 10
        },
        "y2": {
            "valueRange": [
                null,
                null
            ],
            "tickFormat": {
                "unit": "auto",
                "precision": "auto",
                "unitDisplay": true,
                "max": 0,
                "min": null
            },
            "drawGrid": true,
            "independentTicks": true,
            "logscale": false,
            "drawAxis": false,
            "axisLabelWidth": 0,
            "axisLabelFontSize": 10
        }
    },
    "series": {
        "1": {
            "strokeWidth": 1,
            "strokePattern": [],
            "fillGraph": false,
            "isStacked": false,
            "axis": "y",
            "metric": "Yamas.system.cpu.cpu.idle",
            "tags": {
                "metric": "Yamas.system.cpu.cpu.idle"
            },
            "aggregations": {
                "sum": 205118399.88829207,
                "count": 59,
                "min": 3356253.232115142,
                "max": 3568458.627042899,
                "avg": 3476583.048954103,
                "first": 3455646.9192100326,
                "last": 3462804.358924385
            },
            "group": "line",
            "order1": "1-0-0",
            "stackOrderBy": "min",
            "stackOrder": "asc",
            "connectMissingData": false,
            "label": "Yamas.system.cpu.cpu.idle",
            "color": "#0000FF",
            "hash": "Yamas.system.cpu.cpu.idle"
        },
        "2": {
            "strokeWidth": 1,
            "strokePattern": [],
            "fillGraph": false,
            "isStacked": false,
            "axis": "y",
            "metric": "Yamas.system.cpu.busy.pct1",
            "tags": {
                "metric": "Yamas.system.cpu.busy.pct1"
            },
            "aggregations": {
                "sum": 1285787.5149417296,
                "count": 59,
                "min": 20390.98419067054,
                "max": 24137.155613413197,
                "avg": 21793.008727825927,
                "first": 22280.7367488147,
                "last": 21471.298434161232
            },
            "group": "line",
            "order1": "1-0-1",
            "stackOrderBy": "min",
            "stackOrder": "asc",
            "connectMissingData": false,
            "label": "Yamas.system.cpu.busy.pct1",
            "color": "#008000",
            "hash": "Yamas.system.cpu.busy.pct1"
        }
    },
    "visibility": [
        true,
        true
    ],
    "visibilityHash": {
        "Yamas.system.cpu.cpu.idle": true,
        "Yamas.system.cpu.busy.pct1": true
    },
    "gridLineColor": "#ccc",
    "isIslandLegendOpen": false,
    "initZoom": null,
    "labelsDiv": {}
};

  chartType: string;
  size: any = { width: 600, height: 250 };
  data: any = { ts: [["2021-12-06T18:12:00.000Z", 3455646.9192100326, 22280.7367488147], ["2021-12-06T18:13:00.000Z", 3460096.6905457536, 22154.002405439387], ["2021-12-06T18:14:00.000Z", 3455813.7484380044, 22263.095010735444], ["2021-12-06T18:15:00.000Z", 3447249.621128494, 22451.436078721425], ["2021-12-06T18:16:00.000Z", 3399373.856521966, 23347.183798065176], ["2021-12-06T18:17:00.000Z", 3431721.938678328, 22520.33861895185], ["2021-12-06T18:18:00.000Z", 3446108.6032095253, 22186.515458024107], ["2021-12-06T18:19:00.000Z", 3442863.506958451, 22374.401084526675], ["2021-12-06T18:20:00.000Z", 3445737.563978821, 22207.548551495653], ["2021-12-06T18:21:00.000Z", 3404611.997694364, 23209.64226586756], ["2021-12-06T18:22:00.000Z", 3453669.3096221164, 22135.90560545912], ["2021-12-06T18:23:00.000Z", 3451208.4846862317, 22339.40898609592], ["2021-12-06T18:24:00.000Z", 3464826.8103271397, 21932.461159231025], ["2021-12-06T18:25:00.000Z", 3555720.049821809, 20451.156507578446], ["2021-12-06T18:26:00.000Z", 3507312.96485228, 21477.34284143499], ["2021-12-06T18:27:00.000Z", 3552405.2103822744, 20562.6680714814], ["2021-12-06T18:28:00.000Z", 3568458.627042899, 20390.98419067054], ["2021-12-06T18:29:00.000Z", 3541890.793633462, 20766.34696003748], ["2021-12-06T18:30:00.000Z", 3505171.2243957324, 21084.532087485655], ["2021-12-06T18:31:00.000Z", 3412301.9585510762, 22843.22883711802], ["2021-12-06T18:32:00.000Z", 3441562.669032787, 22269.963622986106], ["2021-12-06T18:33:00.000Z", 3476932.3545702863, 21411.811523112003], ["2021-12-06T18:34:00.000Z", 3473913.1649535093, 21367.485062973225], ["2021-12-06T18:35:00.000Z", 3479789.361038044, 21178.532294094097], ["2021-12-06T18:36:00.000Z", 3436448.3654122176, 22134.71249189414], ["2021-12-06T18:37:00.000Z", 3478342.4124584384, 21464.7591869561], ["2021-12-06T18:38:00.000Z", 3506357.9489796124, 21105.232322137454], ["2021-12-06T18:39:00.000Z", 3490236.408146818, 21410.763223387068], ["2021-12-06T18:40:00.000Z", 3489300.281390193, 21339.65532244998], ["2021-12-06T18:41:00.000Z", 3450179.7036855593, 22246.970584506053], ["2021-12-06T18:42:00.000Z", 3497854.934794912, 21402.481060224003], ["2021-12-06T18:43:00.000Z", 3514722.5423076656, 21019.84342597949], ["2021-12-06T18:44:00.000Z", 3528597.5722246747, 20760.038961961167], ["2021-12-06T18:45:00.000Z", 3518615.8534017354, 20800.491711831186], ["2021-12-06T18:46:00.000Z", 3477342.705572173, 21723.036790151033], ["2021-12-06T18:47:00.000Z", 3494998.020684007, 21618.527214434696], ["2021-12-06T18:48:00.000Z", 3545517.54684252, 20637.3155341316], ["2021-12-06T18:49:00.000Z", 3527826.375205404, 20929.434403043007], ["2021-12-06T18:50:00.000Z", 3519054.2878096085, 21038.636407742742], ["2021-12-06T18:51:00.000Z", 3463885.9643087164, 22437.87822712434], ["2021-12-06T18:52:00.000Z", 3488156.6135643125, 22229.091433858848], ["2021-12-06T18:53:00.000Z", 3530672.766761882, 20682.25891237834], ["2021-12-06T18:54:00.000Z", 3515654.7933684224, 20943.13117142883], ["2021-12-06T18:55:00.000Z", 3509382.5366157033, 21025.568019787548], ["2021-12-06T18:56:00.000Z", 3490122.831688619, 21438.47117923363], ["2021-12-06T18:57:00.000Z", 3532048.722551278, 20772.374636097462], ["2021-12-06T18:58:00.000Z", 3522763.065281639, 20841.767128331237], ["2021-12-06T18:59:00.000Z", 3529001.3699052706, 20536.098172677564], ["2021-12-06T19:00:00.000Z", 3516528.172962185, 20828.269149403903], ["2021-12-06T19:01:00.000Z", 3356253.232115142, 24137.155613413197], ["2021-12-06T19:02:00.000Z", 3401679.100432083, 23682.147105384734], ["2021-12-06T19:03:00.000Z", 3416530.041403343, 23049.389501155587], ["2021-12-06T19:04:00.000Z", 3435807.8317697905, 22812.778509509983], ["2021-12-06T19:05:00.000Z", 3419286.3114753533, 22934.73794973595], ["2021-12-06T19:06:00.000Z", 3378726.8323598644, 23903.67852174258], ["2021-12-06T19:07:00.000Z", 3444459.8475446003, 22948.467099398607], ["2021-12-06T19:08:00.000Z", 3477742.0670479257, 22330.64818404347], ["2021-12-06T19:09:00.000Z", 3477111.0400226302, 21943.679581632954], ["2021-12-06T19:10:00.000Z", 3462804.358924385, 21471.298434161232]] };
  /*
  options: IDygraphOptions = {
    labels: ['x'],
    labelsUTC: false,
    labelsKMB: true,
    connectSeparatedPoints: true,
    drawPoints: false,
    //  labelsDivWidth: 0,
    // legend: 'follow',
    logscale: false,
    digitsAfterDecimal: 2,
    fillAlpha: 0.55,
    stackedGraph: false,
    stackedGraphNaNFill: 'none', // default to all will reserve gap
    strokeWidth: 1,
    strokeBorderWidth: 0,
    highlightSeriesBackgroundAlpha: 1,
    highlightSeriesBackgroundColor: 'rgb(255, 255, 255)',
    isZoomedIgnoreProgrammaticZoom: true,
    hideOverlayOnMouseOut: true,
    isCustomZoomed: false,
    theme: '',
    highlightSeriesOpts: {
        strokeWidth: 2,
        highlightCircleSize: 5
    },
    xlabel: '',
    ylabel: '',
    y2label: '',
    axisLineWidth: 0,
    axisTickSize: 0,
    axisLineColor: '#fff',
    axes: {
        y: {
            valueRange: [null, null],
            tickFormat: {}
        },
        y2: {
            valueRange: [null, null],
            tickFormat: {},
            drawGrid: true,
            independentTicks: true
        }
    },
    series: {},
    visibility: [],
    visibilityHash: {},
    gridLineColor: '#ccc',
    isIslandLegendOpen: false,
    initZoom: null
  };
  */
  ngOnInit() {
    this.chartType = "line";
    // console.log("data", this.data.ts);
    for (let i = 0; i < this.data.ts.length; i++) {
      this.data.ts[i][0] = new Date(this.data.ts[i][0]);
      //this.options.labels.push((i + 1).toString());
    }
    console.log('this data', this.data);
  }

}
