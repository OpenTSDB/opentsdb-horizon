export const TIMESERIES_LEGEND_ISLAND_MOCK_DATA ={
    "widget": {
        "gridPos": {
            "x": 0,
            "y": 3,
            "h": 5,
            "w": 12,
            "xMd": 0,
            "yMd": 3,
            "wMd": 12,
            "hMd": 5,
            "xSm": 0,
            "ySm": 3,
            "wSm": 1,
            "hSm": 1
        },
        "settings": {
            "title": "system.metric",
            "component_type": "LinechartWidgetComponent",
            "visual": {
                "showEvents": false
            },
            "axes": {
                "y1": {
                    "enabled": true
                },
                "y2": {
                    "enabled": false
                }
            },
            "time": {
                "downsample": {
                    "value": "auto",
                    "aggregator": "avg",
                    "customValue": "",
                    "customUnit": "",
                    "minInterval": "",
                    "reportingInterval": ""
                }
            },
            "chartOptions": {},
            "legend": {
                "display": false,
                "position": "bottom",
                "columns": []
            }
        },
        "queries": [
            {
                "metrics": [
                    {
                        "id": "sli",
                        "name": "system.metric",
                        "filters": [],
                        "settings": {
                            "visual": {
                                "visible": true,
                                "color": "",
                                "label": ""
                            }
                        },
                        "tagAggregator": "sum",
                        "functions": [],
                        "groupByTags": [
                            "colo"
                        ]
                    }
                ],
                "filters": [
                    {
                        "tagk": "colo",
                        "customFilter": [
                            "[colo]"
                        ],
                        "filter": [],
                        "groupBy": false
                    }
                ],
                "settings": {
                    "visual": {
                        "visible": true,
                        "label": ""
                    },
                    "infectiousNan": false
                },
                "id": "o68",
                "namespace": "namespace1"
            }
        ],
        "id": "k06vbq",
        "eventQueries": [
            {
                "namespace": "",
                "search": "",
                "id": "q1_m1"
            }
        ]
    },
    "originId": "k06vbq",
    "data": {
        "multigraph": null,
        "options": {
            "labels": [
                "x",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9"
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
                        "max": 21738.035955014173,
                        "min": 1.4644399993121624
                    },
                    "logscale": false,
                    "drawAxis": true,
                    "axisLabelWidth": 50,
                    "pixelsPerLabel": 50
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
                    "pixelsPerLabel": 50
                }
            },
            "series": {
                "1": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "system.metric",
                    "tags": {
                        "metric": "system.metric",
                        "colo": "colo1"
                    },
                    "aggregations": {
                        "sum": 194372.8162207175,
                        "count": 59,
                        "min": 2884.1885454554576,
                        "max": 4049.6798603096977,
                        "avg": 3294.454512215551,
                        "first": 2991.9135675393045,
                        "last": 3097.6143120999914
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "system.metric-colo1",
                    "color": "#0000FF",
                    "hash": "system.metric-colo:colo1"
                },
                "2": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo2"
                    },
                    "aggregations": {
                        "sum": 731863.2532776706,
                        "count": 59,
                        "min": 9590.67439053161,
                        "max": 15822.901247746777,
                        "avg": 12404.461919960519,
                        "first": 13857.102499767207,
                        "last": 9590.67439053161
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo2",
                    "color": "#008000",
                    "hash": "System.metric-colo:colo2"
                },
                "3": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo3"
                    },
                    "aggregations": {
                        "sum": 493.932849381119,
                        "count": 59,
                        "min": 4.1565999910235405,
                        "max": 24.56658998131752,
                        "avg": 8.371743209849475,
                        "first": 5.884919993579388,
                        "last": 5.761799991130829
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo3",
                    "color": "#FFA500",
                    "hash": "System.metric-colo:colo3"
                },
                "4": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo4"
                    },
                    "aggregations": {
                        "sum": 213.33328972011805,
                        "count": 59,
                        "min": 1.4644399993121624,
                        "max": 13.841599971055984,
                        "avg": 3.6158184698325093,
                        "first": 8.090209990739822,
                        "last": 5.5099599957466125
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo4",
                    "color": "#808000",
                    "hash": "System.metric-colo:colo4"
                },
                "5": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo5"
                    },
                    "aggregations": {
                        "sum": 1017750.2275974689,
                        "count": 59,
                        "min": 12594.666997727472,
                        "max": 21738.035955014173,
                        "avg": 17250.00385758422,
                        "first": 18313.39819508337,
                        "last": 12594.666997727472
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo5",
                    "color": "#800080",
                    "hash": "System.metric-colo:colo5"
                },
                "6": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo6"
                    },
                    "aggregations": {
                        "sum": 1590.591348953545,
                        "count": 59,
                        "min": 17.185150980949402,
                        "max": 32.12249396368861,
                        "avg": 26.95917540599229,
                        "first": 24.1564379632473,
                        "last": 17.185150980949402
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo6",
                    "color": "#0BC582",
                    "hash": "System.metric-colo:colo6"
                },
                "7": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo7"
                    },
                    "aggregations": {
                        "sum": 6418.164071157575,
                        "count": 59,
                        "min": 67.84903991222382,
                        "max": 125.25429984927177,
                        "avg": 108.7824418840267,
                        "first": 109.5926598906517,
                        "last": 67.84903991222382
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo7",
                    "color": "#9E8317",
                    "hash": "System.metric-colo:colo7"
                },
                "8": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo8"
                    },
                    "aggregations": {
                        "sum": 1951.0466832220554,
                        "count": 59,
                        "min": 26.5830799639225,
                        "max": 42.12935993820429,
                        "avg": 33.06858785122128,
                        "first": 30.093799948692322,
                        "last": 29.57255996391177
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo8",
                    "color": "#847D81",
                    "hash": "System.metric-colo:colo8"
                },
                "9": {
                    "strokeWidth": 1,
                    "strokePattern": [],
                    "fillGraph": false,
                    "isStacked": false,
                    "axis": "y",
                    "metric": "System.metric",
                    "tags": {
                        "metric": "System.metric",
                        "colo": "colo9"
                    },
                    "aggregations": {
                        "sum": 707.6095631304197,
                        "count": 59,
                        "min": 8.130811994429678,
                        "max": 16.408773973584175,
                        "avg": 11.993382425939316,
                        "first": 10.563005982898176,
                        "last": 8.130811994429678
                    },
                    "group": "line",
                    "order1": "1-0-0",
                    "stackOrderBy": "min",
                    "stackOrder": "asc",
                    "connectMissingData": false,
                    "label": "System.metric-colo9",
                    "color": "#58018B",
                    "hash": "System.metric-colo:colo9"
                }
            },
            "visibility": [
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true
            ],
            "visibilityHash": {
                "System.metric-colo:colo1": true,
                "System.metric-colo:colo2": true,
                "System.metric-colo:colo3": true,
                "System.metric-colo:colo4": true,
                "System.metric-colo:colo5": true,
                "System.metric-colo:colo6": true,
                "System.metric-colo:colo7": true,
                "System.metric-colo:colo8": true,
                "System.metric-colo:colo9": true
            },
            "gridLineColor": "#ccc",
            "isIslandLegendOpen": false,
            "initZoom": null,
            "labelsDiv": {},
            "plugins": [
                null
            ],
            "showLabelsOnHighlight": false,
            "interactionModel": {
                "willDestroyContextMyself": true
            },
            "width": 1778,
            "height": 338.75
        },
        "queries": [
            {
                "metrics": [
                    {
                        "id": "sli",
                        "name": "system.metric",
                        "filters": [],
                        "settings": {
                            "visual": {
                                "visible": true,
                                "color": "",
                                "label": ""
                            }
                        },
                        "tagAggregator": "sum",
                        "functions": [],
                        "groupByTags": [
                            "colo"
                        ]
                    }
                ],
                "filters": [
                    {
                        "tagk": "colo",
                        "customFilter": [
                            "[colo]"
                        ],
                        "filter": [],
                        "groupBy": false
                    }
                ],
                "settings": {
                    "visual": {
                        "visible": true,
                        "label": ""
                    },
                    "infectiousNan": false
                },
                "id": "o68",
                "namespace": "Yamas"
            }
        ],
        "settings": {
            "title": "system.metric",
            "component_type": "LinechartWidgetComponent",
            "visual": {
                "showEvents": false
            },
            "axes": {
                "y1": {
                    "enabled": true
                },
                "y2": {
                    "enabled": false
                }
            },
            "time": {
                "downsample": {
                    "value": "auto",
                    "aggregator": "avg",
                    "customValue": "",
                    "customUnit": "",
                    "minInterval": "",
                    "reportingInterval": ""
                }
            },
            "chartOptions": {},
            "legend": {
                "display": false,
                "position": "bottom",
                "columns": []
            }
        },
        "tsTickData": {
            "timestamp": 1710368760000,
            "when": "2024/03/13 15:26",
            "series": [
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "bf1"
                        },
                        "aggregations": {
                            "sum": 194372.8162207175,
                            "count": 59,
                            "min": 2884.1885454554576,
                            "max": 4049.6798603096977,
                            "avg": 3294.454512215551,
                            "first": 2991.9135675393045,
                            "last": 3097.6143120999914
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-color1",
                        "color": "#0000FF",
                        "hash": "System.metric-colo:colo1"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.8306401875320905,
                        "xval": 1710368760000,
                        "yval": 4049.6798603096977,
                        "name": "1",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 269.9580609479294
                    },
                    "formattedValue": "4.05 k",
                    "srcIndex": 0,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo2"
                        },
                        "aggregations": {
                            "sum": 731863.2532776706,
                            "count": 59,
                            "min": 9590.67439053161,
                            "max": 15822.901247746777,
                            "avg": 12404.461919960519,
                            "first": 13857.102499767207,
                            "last": 9590.67439053161
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo2",
                        "color": "#008000",
                        "hash": "System.metric-colo:colo2"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.4909726520282077,
                        "xval": 1710368760000,
                        "yval": 12171.705727525055,
                        "name": "2",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 159.56611190916752
                    },
                    "formattedValue": "12.17 k",
                    "srcIndex": 1,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo3"
                        },
                        "aggregations": {
                            "sum": 493.932849381119,
                            "count": 59,
                            "min": 4.1565999910235405,
                            "max": 24.56658998131752,
                            "avg": 8.371743209849475,
                            "first": 5.884919993579388,
                            "last": 5.761799991130829
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo3",
                        "color": "#FFA500",
                        "hash": "System.metric-colo:colo3"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.9995116230401652,
                        "xval": 1710368760000,
                        "yval": 11.67791998386383,
                        "name": "3",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 324.84127748805366
                    },
                    "formattedValue": "11.68 ",
                    "srcIndex": 2,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo4"
                        },
                        "aggregations": {
                            "sum": 213.33328972011805,
                            "count": 59,
                            "min": 1.4644399993121624,
                            "max": 13.841599971055984,
                            "avg": 3.6158184698325093,
                            "first": 8.090209990739822,
                            "last": 5.5099599957466125
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo4",
                        "color": "#808000",
                        "hash": "System.metric-colo:colo4"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.9998522910954665,
                        "xval": 1710368760000,
                        "yval": 3.5319699943065643,
                        "name": "4",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 324.95199460602663
                    },
                    "formattedValue": "3.53 ",
                    "srcIndex": 3,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo5"
                        },
                        "aggregations": {
                            "sum": 1017750.2275974689,
                            "count": 59,
                            "min": 12594.666997727472,
                            "max": 21738.035955014173,
                            "avg": 17250.00385758422,
                            "first": 18313.39819508337,
                            "last": 12594.666997727472
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo5",
                        "color": "#800080",
                        "hash": "System.metric-colo:colo5"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.2403420857436851,
                        "xval": 1710368760000,
                        "yval": 18164.70691163279,
                        "name": "5",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 78.11117786669766
                    },
                    "formattedValue": "18.16 k",
                    "srcIndex": 4,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo6"
                        },
                        "aggregations": {
                            "sum": 1590.591348953545,
                            "count": 59,
                            "min": 17.185150980949402,
                            "max": 32.12249396368861,
                            "avg": 26.95917540599229,
                            "first": 24.1564379632473,
                            "last": 17.185150980949402
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo6",
                        "color": "#0BC582",
                        "hash": "System.metric-colo:colo6"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.9987407638670726,
                        "xval": 1710368760000,
                        "yval": 30.110467959195375,
                        "name": "6",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 324.5907482567986
                    },
                    "formattedValue": "30.11 ",
                    "srcIndex": 5,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo7"
                        },
                        "aggregations": {
                            "sum": 6418.164071157575,
                            "count": 59,
                            "min": 67.84903991222382,
                            "max": 125.25429984927177,
                            "avg": 108.7824418840267,
                            "first": 109.5926598906517,
                            "last": 67.84903991222382
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo7",
                        "color": "#9E8317",
                        "hash": "System.metric-colo:colo7"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.995186943087094,
                        "xval": 1710368760000,
                        "yval": 115.08833980560303,
                        "name": "7",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 323.4357565033055
                    },
                    "formattedValue": "115.088 ",
                    "srcIndex": 6,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo8"
                        },
                        "aggregations": {
                            "sum": 1951.0466832220554,
                            "count": 59,
                            "min": 26.5830799639225,
                            "max": 42.12935993820429,
                            "avg": 33.06858785122128,
                            "first": 30.093799948692322,
                            "last": 29.57255996391177
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo8",
                        "color": "#847D81",
                        "hash": "System.metric-colo:colo8"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.9984203987659731,
                        "xval": 1710368760000,
                        "yval": 37.77093993872404,
                        "name": "8",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 324.48662959894125
                    },
                    "formattedValue": "37.77 ",
                    "srcIndex": 7,
                    "visible": true
                },
                {
                    "series": {
                        "strokeWidth": 1,
                        "strokePattern": [],
                        "fillGraph": false,
                        "isStacked": false,
                        "axis": "y",
                        "metric": "System.metric",
                        "tags": {
                            "metric": "System.metric",
                            "colo": "colo9"
                        },
                        "aggregations": {
                            "sum": 707.6095631304197,
                            "count": 59,
                            "min": 8.130811994429678,
                            "max": 16.408773973584175,
                            "avg": 11.993382425939316,
                            "first": 10.563005982898176,
                            "last": 8.130811994429678
                        },
                        "group": "line",
                        "order1": "1-0-0",
                        "stackOrderBy": "min",
                        "stackOrder": "asc",
                        "connectMissingData": false,
                        "label": "System.metric-colo9",
                        "color": "#58018B",
                        "hash": "System.metric-colo:colo9"
                    },
                    "data": {
                        "x": 0.2931034482758621,
                        "y": 0.9993903785097203,
                        "xval": 1710368760000,
                        "yval": 14.577081986702979,
                        "name": "9",
                        "idx": 17,
                        "canvasx": 555.0172413793105,
                        "canvasy": 324.8018730156591
                    },
                    "formattedValue": "14.58 ",
                    "srcIndex": 8,
                    "visible": true
                }
            ]
        }
    }
};
