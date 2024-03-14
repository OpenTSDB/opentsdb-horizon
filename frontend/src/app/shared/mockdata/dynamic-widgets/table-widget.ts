
import {
    WidgetModel,
} from '../../../dashboard/state/widgets.state';

export const TABLE_WIDGET_MOCK_DATA: WidgetModel = {
    'gridPos': {
        'x': 8,
        'y': 5,
        'h': 5,
        'w': 4,
        'xMd': 8,
        'yMd': 5,
        'wMd': 4,
        'hMd': 5,
        'xSm': 8,
        'ySm': 5,
        'wSm': 1,
        'hSm': 1
    },
    'settings': {
        'title': 'Table Widget',
        'component_type': 'TableWidgetComponent',
        'visual': {},
        'axes': {},
        'legend': {
            'display': false,
            'position': '0px'
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
        'layout': 'column'
    },
    'queries': [
        {
            'metrics': [
                {
                    'id': 'zp2',
                    'name': 'system.busy',
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
                    'summarizer': '',
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
                }
            ],
            'settings': {
                'visual': {
                    'visible': true,
                    'label': ''
                },
                'infectiousNan': false
            },
            'id': '24u',
            'namespace': 'horizon'
        }
    ],
    'id': 'avzngl'
};
