import { WidgetModel } from '../../../dashboard/state';

export const LINECHART_WIDGET_MOCK_DATA: WidgetModel = {
    "gridPos": {
        "x": 0,
        "y": 3,
        "h": 5,
        "w": 12
    },
    "settings": {
        "title": "system.cpu.busy.pct",
        "component_type": "LinechartWidgetComponent",
        "visual": {
            "showEvents": false
        },
        "axes": {
            "y1": {
                "enabled": true,
                "unit": "",
                "scale": "linear",
                "min": "auto",
                "max": "auto",
                "decimals": "auto",
                "label": "",
                "type": ""
            },
            "y2": {
                "enabled": true,
                "unit": "nanoseconds",
                "scale": "linear",
                "min": "auto",
                "max": "auto",
                "decimals": "auto",
                "label": "",
                "type": ""
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
                    "name": "system.cpu.busy.pct",
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
    "id": "k06vbq",
    "eventQueries": [
        {
            "namespace": "",
            "search": "",
            "id": "q1_m1"
        }
    ]
};

export const MULTIGRAPH_LINECHART_WIDGET_MOCK_DATA = {
    "gridPos": {
        "x": 0,
        "y": 0,
        "h": 5,
        "w": 12
    },
    "settings": {
        "title": "MULTIGRAPH",
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
        "legend": {
            "display": false,
            "position": "bottom",
            "columns": []
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
        "multigraph": {
            "chart": [
                {
                    "key": "metric_group",
                    "displayAs": "g",
                    "sortAs": "asc"
                },
                {
                    "key": "colo",
                    "displayAs": "x",
                    "sortAs": "asc"
                }
            ],
            "layout": "grid",
            "enabled": true,
            "gridOptions": {
                "viewportDisplay": "custom",
                "custom": {
                    "x": 3,
                    "y": 3
                }
            }
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
                    "summarizer": "",
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
};
