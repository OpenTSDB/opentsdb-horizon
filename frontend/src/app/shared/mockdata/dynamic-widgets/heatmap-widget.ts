export const HEATMAP_WIDGET_MOCK_DATA = {
    "gridPos": {
        "x": 0,
        "y": 13,
        "h": 5,
        "w": 4
    },
    "settings": {
        "title": "system.metric",
        "component_type": "HeatmapWidgetComponent",
        "data_source": "namespace2",
        "visual": {
            "color": "#3F00FF"
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
        }
    },
    "queries": [
        {
            "namespace": "namespace1",
            "metrics": [
                {
                    "id": "111",
                    "name": "system.metric",
                    "filters": [],
                    "settings": {
                        "visual": {
                            "visible": true,
                            "label": ""
                        }
                    },
                    "tagAggregator": "sum",
                    "functions": [],
                    "groupByTags": [
                        "colo",
                        "host"
                    ]
                },
                {
                    "id": "qnz",
                    "name": "system.metric2",
                    "filters": [],
                    "settings": {
                        "visual": {
                            "visible": false,
                            "label": ""
                        }
                    },
                    "tagAggregator": "sum",
                    "functions": [],
                    "groupByTags": [
                        "colo",
                        "host"
                    ]
                }
            ],
            "filters": [
                {
                    "tagk": "env",
                    "filter": [
                        "prod"
                    ],
                    "customFilter": [],
                    "groupBy": false
                },
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
                    "visible": true
                },
                "infectiousNan": false
            },
            "id": "5eh"
        }
    ],
    "id": "4y2mp7"
}
