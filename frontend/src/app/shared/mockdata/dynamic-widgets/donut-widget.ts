export const DONUT_WIDGET_MOCK_DATA = {
    'gridPos': {
        'x': 4,
        'y': 18,
        'h': 5,
        'w': 4
    },
    'settings': {
        'title': 'system.metric',
        'component_type': 'DonutWidgetComponent',
        'data_source': 'horizon',
        'visual': {
            'type': 'doughnut'
        },
        'legend': {
            'display': true,
            'position': 'bottom',
            'showPercentages': false
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
                    'name': 'system.cmetric',
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
                },
                {
                    'id': 'qnz',
                    'name': 'system.metric2',
                    'filters': [],
                    'settings': {
                        'visual': {
                            'visible': true,
                            'color': '#1CB84F',
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
    'id': 'x3bycx'
}
