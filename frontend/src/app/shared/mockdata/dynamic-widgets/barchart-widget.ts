export const BARCHART_WIDGET_MOCK_DATA = {
    'gridPos': {
        'x': 4,
        'y': 10,
        'h': 5,
        'w': 4
    },
    'settings': {
        'title': 'Barchart Test Widget',
        'component_type': 'BarchartWidgetComponent',
        'data_source': 'horizon',
        'visual': {
            'type': 'vertical'
        },
        'axes': {
            'y1': {}
        },
        'time': {
            'downsample': {
                'value': 'auto',
                'aggregator': 'avg',
                'customValue': '',
                'customUnit': '',
                'minInterval': '',
                'reportingInterval': ''
            }
        },
        'sorting': {
            'limit': 25,
            'order': 'top'
        }
    },
    'queries': [
        {
            'namespace': 'namespace1',
            'metrics': [
                {
                    'id': '111',
                    'name': 'system.metric',
                    'filters': [],
                    'settings': {
                        'visual': {
                            'visible': true,
                            'color': '',
                            'label': ''
                        }
                    },
                    'tagAggregator': 'sum',
                    'functions': [],
                    'summarizer': 'avg',
                    'groupByTags': [
                        'colo'
                    ]
                }
            ],
            'filters': [
                {
                    'tagk': 'env',
                    'filter': [
                        'prod'
                    ],
                    'customFilter': [],
                    'groupBy': false
                },
                {
                    'tagk': 'colo',
                    'customFilter': [
                        '[colo]'
                    ],
                    'filter': [],
                    'groupBy': false
                }
            ],
            'settings': {
                'visual': {
                    'visible': true
                },
                'infectiousNan': false
            },
            'id': '5eh'
        }
    ],
    'id': 'abc123'
};
