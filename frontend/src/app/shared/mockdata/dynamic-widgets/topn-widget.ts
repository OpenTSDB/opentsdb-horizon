export const TOPN_WIDGET_MOCK_DATA = {
    'gridPos': {
        'x': 0,
        'y': 18,
        'h': 5,
        'w': 4
    },
    'settings': {
        'title': 'system.metric',
        'component_type': 'TopnWidgetComponent',
        'data_source': 'horizon',
        'visual': {
            'color': '#800080',
            'scheme': ''
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
            'limit': 10,
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
                    'tagk': 'colo',
                    'customFilter': [
                        '[colo]'
                    ],
                    'filter': [],
                    'groupBy': false
                },
                {
                    'tagk': 'env',
                    'filter': [
                        'prod'
                    ],
                    'customFilter': [],
                    'groupBy': false
                }
            ],
            'settings': {
                'visual': {
                    'visible': true,
                    'label': ''
                },
                'infectiousNan': false
            },
            'id': '5eh'
        }
    ],
    'id': '5c1rjk'
}
