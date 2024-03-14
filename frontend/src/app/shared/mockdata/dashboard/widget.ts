export const DASHBOARD_TESTING_WIDGET = {
    'gridPos': {
        'x': 0,
        'y': 0,
        'h': 3,
        'w': 3
    },
    'settings': {
        'title': 'CPU Detail',
        'component_type': 'LinechartWidgetComponent',
        'data_source': 'horizon',
        'visual': {
            'showEvents': false,
            'stackOrder': 'max'
        },
        'axes': {
            'y1': {
                'enabled': true,
                'unit': '',
                'scale': 'linear',
                'min': 'auto',
                'max': 'auto',
                'decimals': 'auto',
                'label': '%'
            },
            'y2': {
                'enabled': false,
                'unit': '',
                'scale': 'linear',
                'min': 'auto',
                'max': 'auto',
                'decimals': 'auto',
                'label': ''
            }
        },
        'legend': {
            'display': false,
            'position': 'bottom',
            'columns': []
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
        'description': null,
        'chartOptions': {}
    },
    'queries': [
        {
            'namespace': 'Yahoo',
            'metrics': [
                {
                    'id': 'c9f',
                    'name': 'system.cmetric',
                    'filters': [],
                    'settings': {
                        'visual': {
                            'visible': false,
                            'color': '',
                            'label': '',
                            'type': 'area',
                            'lineWeight': '1px',
                            'lineType': 'solid',
                            'axis': 'y1'
                        }
                    },
                    'tagAggregator': 'sum',
                    'functions': [],
                    'summarizer': '',
                    'groupByTags': [
                        'host'
                    ]
                }
            ],
            'filters': [
                {
                    'tagk': 'host',
                    'filter': [
                        'somehost.com'
                    ],
                    'customFilter': [
                        '[host]'
                    ],
                    'groupBy': false
                }
            ],
            'settings': {
                'visual': {
                    'visible': true,
                    'label': ''
                },
                'infectiousNan': true
            },
            'id': 'it0'
        }
    ],
    'id': 'fcqmgm',
    'eventQueries': [
        {
            'namespace': 'Namespace',
            'search': '',
            'id': 'q1_m1'
        }
    ]
};
