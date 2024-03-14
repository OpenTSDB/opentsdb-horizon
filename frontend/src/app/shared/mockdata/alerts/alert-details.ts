export const ALERT_DETAILS_TESTING_DATA = {
    'createdTime': '01/05/2024 12:40 PM',
    'createdBy': 'user.name',
    'updatedTime': '01/11/2024 7:45 AM',
    'updatedBy': 'user.name',
    'id': 123456,
    'name': '[metrics][Prod] metrics test logs',
    'slug': 'metrics-prod-metrics-test-logs',
    'namespace': 'Namespace',
    'type': 'simple',
    'enabled': true,
    'deleted': false,
    'version': 1,
    'labels': [
        'AuraMetrics',
        'Prod'
    ],
    'queries': {
        'raw': [
            {
                'id': 'abd123',
                'namespace': 'Yamas',
                'metrics': [
                    {
                        'id': '222',
                        'name': 'file.age.sec',
                        'filters': [],
                        'settings': {
                            'visual': {
                                'visible': true,
                                'color': '',
                                'label': ''
                            }
                        },
                        'tagAggregator': 'max',
                        'functions': [],
                        'summarizer': '',
                        'groupByTags': [
                            'host'
                        ]
                    }
                ],
                'filters': [
                    {
                        'tagk': 'path',
                        'filter': [
                            'server.log'
                        ],
                        'customFilter': [],
                        'groupBy': false
                    }
                ],
                'settings': {
                    'visual': {
                        'visible': true,
                        'label': ''
                    }
                }
            }
        ],
        'tsdb': [
            {
                'start': '1h-ago',
                'executionGraph': [
                    {
                        'id': 'q1_m1',
                        'type': 'TimeSeriesDataSource',
                        'metric': {
                            'type': 'MetricLiteral',
                            'metric': 'prod.sec'
                        },
                        'sourceId': null,
                        'fetchLast': false,
                        'filter': {
                            'type': 'Chain',
                            'op': 'AND',
                            'filters': [
                                {
                                    'type': 'TagValueLiteralOr',
                                    'filter': 'server.log',
                                    'tagKey': 'path'
                                },
                                {
                                    'type': 'TagValueRegex',
                                    'filter': '.*',
                                    'tagKey': 'host'
                                }
                            ]
                        }
                    },
                    {
                        'id': 'q1_m1_downsample',
                        'type': 'downsample',
                        'aggregator': 'avg',
                        'interval': 'auto',
                        'runAll': false,
                        'fill': true,
                        'interpolatorConfigs': [
                            {
                                'dataType': 'numeric',
                                'fillPolicy': 'NAN',
                                'realFillPolicy': 'NONE'
                            }
                        ],
                        'sources': [
                            'q1_m1'
                        ]
                    },
                    {
                        'id': 'q1_m1_groupby',
                        'type': 'groupby',
                        'aggregator': 'max',
                        'tagKeys': [
                            'host'
                        ],
                        'interpolatorConfigs': [
                            {
                                'dataType': 'numeric',
                                'fillPolicy': 'NAN',
                                'realFillPolicy': 'NONE'
                            }
                        ],
                        'sources': [
                            'q1_m1_downsample'
                        ]
                    },
                    {
                        'id': 'summarizer',
                        'sources': [
                            'q1_m1_groupby'
                        ],
                        'summaries': [
                            'avg',
                            'max',
                            'min',
                            'count',
                            'sum',
                            'first',
                            'last'
                        ]
                    }
                ],
                'serdesConfigs': [
                    {
                        'id': 'JsonV3QuerySerdes',
                        'filter': [
                            'q1_m1_groupby',
                            'summarizer'
                        ]
                    }
                ],
                'logLevel': 'ERROR',
                'cacheMode': null
            }
        ]
    },
    'threshold': {
        'subType': 'singleMetric',
        'nagInterval': '0',
        'notifyOnMissing': 'false',
        'autoRecoveryInterval': null,
        'delayEvaluation': 0,
        'singleMetric': {
            'queryIndex': 0,
            'queryType': 'tsdb',
            'metricId': 'q1_m1_groupby',
            'badThreshold': 600,
            'warnThreshold': null,
            'requiresFullWindow': false,
            'reportingInterval': null,
            'recoveryThreshold': null,
            'recoveryType': 'minimum',
            'slidingWindow': '300',
            'comparisonOperator': 'above',
            'timeSampler': 'all_of_the_times'
        },
        'isNagEnabled': false,
        'suppress': {}
    },
    'notification': {
        'transitionsToNotify': [
            'goodToBad',
            'badToGood'
        ],
        'subject': '[metrics][Prod] metrics stopped',
        'body': 'Test Message - metrics logs are no longer being written to.',
        'opsgeniePriority': 'P5',
        'opsgenieAutoClose': true,
        'opsgenieTags': [
            'metrics',
            'Prod'
        ],
        'runbookId': '',
        'ocSeverity': '5',
        'ocTier': '1',
        'pagerdutyAutoClose': false,
        'recipients': {
            'opsgenie': [
                {
                    'id': 3405,
                    'name': 'Namespace-Prod',
                    'apikey': '123456'
                }
            ]
        }
    },
    'alertGroupingRules': [
        'host'
    ],
    'namespaceId': 22
};
