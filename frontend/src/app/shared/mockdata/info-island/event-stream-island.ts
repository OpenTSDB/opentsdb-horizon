import { Observable } from 'rxjs';
import { WidgetModel } from '../../../dashboard/state';

export interface EVENT_STREAM_ISLAND_DATA_MODEL {
    data: {
        buckets$: Observable<any[]>;
        expandedBucketIndex$: Observable<number>;
        timeRange$: Observable<any>;
        timezone$: Observable<string>
        title: string;
    },
    originId: string;
    widget: any;
}

export const EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA = {
    buckets$: [
        {
            "startTime": 1710353400000,
            "endTime": 1710353760000,
            "width": 300000,
            "events": [
                {
                    "namespace": "namespace1",
                    "source": "somesource",
                    "title": "Uh oh message 1",
                    "message": "%%% \n a more detailed message for Uh Oh 1 \n %%%",
                    "priority": "low",
                    "timestamp": 1710350280000,
                    "endTimestamp": "0",
                    "userId": null,
                    "ongoing": false,
                    "eventId": "2024-03-13_4304555723687772640",
                    "parentIds": [],
                    "childIds": [],
                    "additionalProps": {
                        "aggregation_key": "somesource_job_config.ini",
                        "alert_type": "info"
                    },
                    "tags": {
                        "host": "somesource-domain.some-host.net",
                        "job": "somesource_job_config.ini"
                    },
                    "displayTime": "10:18:00",
                    "showDetails": false
                },
                {
                    "namespace": "namespace1",
                    "source": "somesource",
                    "title": "Uh oh message 2",
                    "message": "%%% \n a more detailed message for Uh Oh 2 \n %%%",
                    "priority": "low",
                    "timestamp": 1710350280000,
                    "endTimestamp": "0",
                    "userId": null,
                    "ongoing": false,
                    "eventId": "2024-03-13_-1534238790680110940",
                    "parentIds": [],
                    "childIds": [],
                    "additionalProps": {
                        "aggregation_key": "somesource_job_config.ini",
                        "alert_type": "info"
                    },
                    "tags": {
                        "host": "somesource-domain.some-host.net",
                        "job": "somesource_job_config.ini"
                    },
                    "displayTime": "10:18:00",
                    "showDetails": false
                },
                {
                    "namespace": "namespace1",
                    "source": "somesource",
                    "title": "Uh oh message 3",
                    "message": "%%% \n a more detailed message for Uh Oh 3 \n %%%",
                    "priority": "low",
                    "timestamp": 1710350280000,
                    "endTimestamp": "0",
                    "userId": null,
                    "ongoing": false,
                    "eventId": "2024-03-13_4297447668719975910",
                    "parentIds": [],
                    "childIds": [],
                    "additionalProps": {
                        "aggregation_key": "somesource_job_config.ini",
                        "alert_type": "info"
                    },
                    "tags": {
                        "host": "somesource-domain.some-host.net",
                        "job": "somesource_job_config.ini"
                    },
                    "displayTime": "10:18:00",
                    "showDetails": false
                },
                {
                    "namespace": "namespace1",
                    "source": "somesource",
                    "title": "Uh oh message 4",
                    "message": "%%% \n a more detailed message for Uh Oh 4 \n %%%",
                    "priority": "low",
                    "timestamp": 1710350280000,
                    "endTimestamp": "0",
                    "userId": null,
                    "ongoing": false,
                    "eventId": "2024-03-13_7391911451543911574",
                    "parentIds": [],
                    "childIds": [],
                    "additionalProps": {
                        "aggregation_key": "somesource_job_config.ini",
                        "alert_type": "info"
                    },
                    "tags": {
                        "host": "somesource-domain.some-host.net",
                        "job": "somesource_job_config.ini"
                    },
                    "displayTime": "10:18:00",
                    "showDetails": false
                }
            ],
            "displayTime": "10:20:00"
        }
    ],
    expandedBucketIndex$: 0,
    timeRange$: {
        "startTime": 1710350280000,
        "endTime": 1710353760000
    },
    timeZone$: 'local'
}

export const EVENT_STREAM_ISLAND_MOCK_DATA = {
    data: {
        buckets$: 'CREATE BEHAVIOR SUBJECT',
        expandedBucketIndex$: 'CREATE BEHAVIOR SUBJECT',
        timeRange$: 'CREATE BEHAVIOR SUBJECT',
        timeZone$: 'CREATE BEHAVIOR SUBJECT',
        title: 'test event stream'
    },
    originId: 'od11q7',
    widget: {
        "gridPos": {
            "x": 0,
            "y": 8,
            "h": 5,
            "w": 4,
            "xMd": 0,
            "yMd": 8,
            "wMd": 4,
            "hMd": 5,
            "xSm": 0,
            "ySm": 8,
            "wSm": 1,
            "hSm": 1
        },
        "settings": {
            "title": "ALERTS.status_bad",
            "component_type": "LinechartWidgetComponent",
            "visual": {
                "showEvents": true
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
            "chartOptions": {}
        },
        "queries": [
            {
                "metrics": [
                    {
                        "id": "bjy",
                        "name": "ALERTS.status_bad",
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
                        "summarizer": ""
                    },
                    {
                        "id": "e1y",
                        "name": "ALERTS.status_warn",
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
                        "summarizer": ""
                    }
                ],
                "filters": [],
                "settings": {
                    "visual": {
                        "visible": true,
                        "label": ""
                    },
                    "infectiousNan": false
                },
                "id": "q0j",
                "namespace": "namespace1"
            }
        ],
        "id": "od11q7",
        "eventQueries": [
            {
                "namespace": "namespace1",
                "search": "",
                "id": "q1_m1"
            }
        ]
    }
}
