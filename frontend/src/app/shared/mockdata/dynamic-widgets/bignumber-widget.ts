export const BIG_NUMBER_WIDGET_MOCK_DATA = {
    'gridPos': {
        'x': 8,
        'y': 13,
        'h': 5,
        'w': 4
    },
    'settings': {
        'title': 'system.metric',
        'component_type': 'BignumberWidgetComponent',
        'data_source': 'horizon',
        'visual': {
            'queryID': 0,
            'prefix': '',
            'unit': '',
            'prefixAlignment': 'middle',
            'unitAlignment': 'middle',
            'prefixSize': 'm',
            'unitSize': 'm',
            'caption': '',
            'precision': 2,
            'backgroundColor': '#0B5ED2',
            'textColor': '#FFFFFF',
            'sparkLineEnabled': false,
            'changedIndicatorEnabled': false,
            'color': '#FFFFFF'
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
                            'visible': true
                        }
                    },
                    'tagAggregator': 'sum',
                    'functions': [],
                    'summarizer': 'avg'
                },
                {
                    'id': 'qnz',
                    'name': 'system.metric2',
                    'filters': [],
                    'settings': {
                        'visual': {
                            'visible': false
                        }
                    },
                    'tagAggregator': 'sum',
                    'functions': [],
                    'summarizer': 'avg'
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
    'id': 'op7lz3'
};
