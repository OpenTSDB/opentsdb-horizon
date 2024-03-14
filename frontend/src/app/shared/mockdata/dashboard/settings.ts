export const DASHBOARD_TESTING_SETTINGS = {
    'time': {
        'start': '2h',
        'end': 'now',
        'zone': 'utc'
    },
    'meta': {
        'title': 'Some dashboard title',
        'description': '',
        'labels': [],
        'namespace': '',
        'isPersonal': false
    },
    'tplVariables': {
        'namespaces': [
            'Namespace'
        ],
        'tvars': [
            {
                'tagk': 'host',
                'alias': 'host',
                'filter': 'some-host.com',
                'mode': 'auto',
                'display': 'some-host.com',
                'applied': 28,
                'isNew': 0
            }
        ]
    },
    'initialZoomTime': {
        'start': '',
        'end': '',
        'zone': ''
    },
    'downsample': {
        'aggregators': [
            ''
        ],
        'customUnit': '',
        'customValue': '',
        'value': 'auto'
    }
};
