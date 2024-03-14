export const DBFS_STATE_TESTING = {
    'initialized': true,
    'error': {},
    'DataResources': {
        'activeUser': 'test-user',
        'users': {
            'test-user': {
                'userid': 'user.test-user',
                'name': 'Test User',
                'firstName': 'Test',
                'memberNamespaces': [
                    'namespace1',
                    'namespace2',
                    'namespace3'
                ],
                'alias': 'test-user'
            },
            'another-user': {
                'userid': 'user.another-user',
                'name': 'Another User',
                'firstName': 'Another',
                'memberNamespaces': [
                    'namespace1'
                ],
                'alias': 'another-user'
            },
        },
        'userList': [
            'another-user',
            'test-user',
        ],
        'namespaces': {
            'namespace1': {
                'createdBy': 'horizon.capi',
                'createdTime': 1550796002124,
                'updatedBy': 'horizon.capi-prod',
                'updatedTime': 1605907801285,
                'id': 99,
                'name': 'Namespace1',
                'alias': 'namespace1',
                'enabled': true,
                'meta': {
                    'gitConfigUrl': 'git@git.some-host.com:test/namespace1-test.git#master',
                    'emailId': 'namespace-devel@some-host.com',
                    'jiraProjectName': 'NAMESPACE1',
                    'dhTracks': [
                        'nsraw'
                    ]
                }
            },
            'namespace2': {
                'createdBy': 'horizon.capi',
                'createdTime': 1550796002124,
                'updatedBy': 'horizon.capi-prod',
                'updatedTime': 1605907801285,
                'id': 99,
                'name': 'Namespace2',
                'alias': 'namespace2',
                'enabled': true,
                'meta': {
                    'gitConfigUrl': 'git@git.some-host.com:test/namespace2-test.git#master',
                    'emailId': 'namespace-devel@some-host.com',
                    'jiraProjectName': 'NAMESPACE2',
                    'dhTracks': [
                        'nsraw'
                    ]
                }
            },
            'namespace3': {
                'createdBy': 'horizon.capi',
                'createdTime': 1550796002124,
                'updatedBy': 'horizon.capi-prod',
                'updatedTime': 1605907801285,
                'id': 99,
                'name': 'Namespace3',
                'alias': 'namespace3',
                'enabled': true,
                'meta': {
                    'gitConfigUrl': 'git@git.some-host.com:test/namespace3-test.git#master',
                    'emailId': 'namespace-devel@some-host.com',
                    'jiraProjectName': 'NAMESPACE3',
                    'dhTracks': [
                        'nsraw'
                    ]
                }
            }
        },
        'namespaceList': [
            'namespace1',
            'namespace2',
            'namespace3',
        ],
        'userFavorites': [
            {
                'createdTime': 1571247272698,
                'createdBy': 'user.test-user',
                'updatedTime': 1672762465586,
                'updatedBy': 'user.test-user',
                'id': 1234,
                'name': 'TEST Metrics',
                'type': 'DASHBOARD',
                'path': '/1234/test-metrics',
                'fullPath': '/namespace/namespace2/test/test-metrics',
                'favoritedTime': 1596493892854
            },
            {
                'createdTime': 1571247272698,
                'createdBy': 'user.another-user',
                'updatedTime': 1672762465586,
                'updatedBy': 'user.another-user',
                'id': 1235,
                'name': 'ANOTHER TEST Metrics',
                'type': 'DASHBOARD',
                'path': '/1235/test-metrics',
                'fullPath': '/namespace/namespace1/test/another-test-metrics',
                'favoritedTime': 1596493892854
            },
        ],
        'userRecents': [
            {
                'createdTime': 1571247272698,
                'createdBy': 'user.test-user',
                'updatedTime': 1672762465586,
                'updatedBy': 'user.test-user',
                'id': 1234,
                'name': 'TEST Metrics',
                'type': 'DASHBOARD',
                'path': '/1234/test-metrics',
                'fullPath': '/namespace/namespace2/test/test-metrics',
                'lastVisitedTime': 1710214920817
            },
            {
                'createdTime': 1571247272698,
                'createdBy': 'user.another-user',
                'updatedTime': 1672762465586,
                'updatedBy': 'user.another-user',
                'id': 1235,
                'name': 'ANOTHER TEST Metrics',
                'type': 'DASHBOARD',
                'path': '/1235/test-metrics',
                'fullPath': '/namespace/namespace1/test/another-test-metrics',
                'lastVisitedTime': 1710214920817
            },
        ],
        'folders': {
            '/namespace/namespace1/trash': {
                'createdTime': 1550796002124,
                'createdBy': 'horizon.capi',
                'updatedTime': 1550796002124,
                'updatedBy': 'horizon.capi',
                'id': 234,
                'name': 'Trash',
                'type': 'DASHBOARD',
                'path': '/123/trash',
                'fullPath': '/namespace/namespace1/trash',
                'ownerType': 'namespace',
                'resourceType': 'folder',
                'icon': 'd-trash',
                'loaded': false,
                'parentPath': '/namespace/namespace1',
                'files': [],
                'subfolders': [],
                'namespace': 'namespace1',
                'trashFolder': true
            },
            '/namespace/namespace1': {
                'createdTime': 1550796002124,
                'createdBy': 'horizon.capi',
                'updatedTime': 1550796002124,
                'updatedBy': 'horizon.capi',
                'id': 233,
                'name': 'Namespace1',
                'type': 'DASHBOARD',
                'path': '/233/namespace1',
                'fullPath': '/namespace/namespace1',
                'subfolders': [
                    '/namespace/namespace1/trash'
                ],
                'files': [
                    '/namespace/namespace1/test-dashboard',
                    '/namespace/namespace1/test-dashboard-of-stuff',
                ],
                'ownerType': 'namespace',
                'resourceType': 'folder',
                'icon': 'd-folder',
                'loaded': false,
                'parentPath': '/namespace/namespace1',
                'topFolder': true,
                'namespace': 'namespace1'
            },
            ':panel-root:': {
                'id': 0,
                'name': 'Home',
                'path': ':panel-root:',
                'fullPath': ':panel-root:',
                'synthetic': true,
                'personal': [
                    '/user/test-user',
                    ':user-favorites:',
                    ':user-recent:',
                    '/user/test-user/trash'
                ],
                'namespaces': [
                    '/namespace/namespace1',
                    '/namespace/namespace2',
                    '/namespace/namespace3',
                ]
            },
            ':mini-root:': {
                'id': 0,
                'name': 'Top Level',
                'path': ':mini-root:',
                'fullPath': ':mini-root:',
                'synthetic': true,
                'moveEnabled': false,
                'selectEnabled': false,
                'subfolders': [
                    '/user/test-user',
                    ':member-namespaces:'
                ]
            },
            '/user/test-user': {
                'createdTime': 1550796185438,
                'createdBy': 'user.test-user',
                'updatedTime': 1550796185438,
                'updatedBy': 'user.test-user',
                'id': 1000,
                'name': 'My Dashboards',
                'type': 'DASHBOARD',
                'path': '/1000/test-user',
                'fullPath': '/user/test-user',
                'subfolders': [
                    '/user/test-user/_clipboard_',
                    '/user/test-user/demo',
                    '/user/test-user/folder-1',
                    '/user/test-user/my-dashboards',
                    '/user/test-user/trash'
                ],
                'files': [
                    '/user/test-user/test-dashboard',
                    '/user/test-user/test-dashboard-of-stuff',
                ],
                'ownerType': 'user',
                'resourceType': 'folder',
                'icon': 'd-folder',
                'loaded': true,
                'parentPath': '/user/test-user',
                'topFolder': true,
                'user': 'test-user'
            },
            ':user-favorites:': {
                'id': 0,
                'name': 'My Favorites',
                'path': ':user-favorites:',
                'fullPath': ':user-favorites:',
                'files': [],
                'resourceType': 'list',
                'ownerType': 'dynamic',
                'icon': 'd-star',
                'synthetic': true,
                'loaded': false,
                'moveEnabled': false,
                'selectEnabled': false,
                'user': 'test-user'
            },
            ':user-recent:': {
                'id': 0,
                'name': 'Recently Visited',
                'path': ':user-recent:',
                'fullPath': ':user-recent:',
                'files': [],
                'resourceType': 'list',
                'ownerType': 'dynamic',
                'icon': 'd-time',
                'synthetic': true,
                'loaded': false,
                'moveEnabled': false,
                'selectEnabled': false,
                'user': 'test-user'
            },
            '/user/test-user/trash': {
                'createdTime': 1550796185438,
                'createdBy': 'user.test-user',
                'updatedTime': 1550796185438,
                'updatedBy': 'user.test-user',
                'id': 1002,
                'name': 'Trash',
                'type': 'DASHBOARD',
                'path': '/1002/trash',
                'fullPath': '/user/test-user/trash',
                'ownerType': 'user',
                'resourceType': 'folder',
                'icon': 'd-trash',
                'loaded': false,
                'parentPath': '/user/test-user',
                'files': [],
                'subfolders': [],
                'user': 'test-user',
                'trashFolder': true
            },
            ':member-namespaces:': {
                'id': 0,
                'name': 'Namespaces',
                'path': ':member-namespaces:',
                'fullPath': ':member-namespaces:',
                'subfolders': [
                    '/namespace/namespace1',
                    '/namespace/namespace2',
                    '/namespace/namespace3'
                ],
                'resourceType': 'userMemberNamespaces',
                'icon': 'd-network-platform',
                'synthetic': true,
                'loaded': false,
                'moveEnabled': false,
                'selectEnabled': false
            },
            ':list-namespaces:': {
                'id': 0,
                'name': 'Namespace List',
                'path': ':list-namespaces:',
                'fullPath': ':list-namespaces:',
                'resourceType': 'list',
                'ownerType': 'dynamic',
                'icon': 'd-network-platform',
                'loaded': false,
                'synthetic': true,
                'moveEnabled': false,
                'selectEnabled': false
            },
            ':list-users:': {
                'id': 0,
                'name': 'User List',
                'path': ':list-users:',
                'fullPath': ':list-users:',
                'resourceType': 'list',
                'ownerType': 'dynamic',
                'icon': 'd-user-group',
                'loaded': false,
                'synthetic': true,
                'moveEnabled': false,
                'selectEnabled': false
            }
        },
        'files': {
            '/user/test-user/test-dashboard': {
                'createdTime': 1556745009800,
                'createdBy': 'user.test-user',
                'updatedTime': 1574117181265,
                'updatedBy': 'user.test-user',
                'id': 5000,
                'name': 'TEST DASHBOARD',
                'type': 'DASHBOARD',
                'path': '/5000/test-dashboard',
                'fullPath': '/user/test-user/test-dashboard',
                'resourceType': 'file',
                'ownerType': 'user',
                'icon': 'd-dashboard-tile',
                'parentPath': '/user/test-user',
                'user': 'test-user'
            },
            '/user/test-user/test-dashboard-of-stuff': {
                'createdTime': 1556745009800,
                'createdBy': 'user.test-user',
                'updatedTime': 1574117181265,
                'updatedBy': 'user.test-user',
                'id': 5000,
                'name': 'TEST DASHBOARD OF STUFF',
                'type': 'DASHBOARD',
                'path': '/5000/test-dashboard-of-stuff',
                'fullPath': '/user/test-user/test-dashboard-of-stuff',
                'resourceType': 'file',
                'ownerType': 'user',
                'icon': 'd-dashboard-tile',
                'parentPath': '/user/test-user',
                'user': 'test-user'
            },
            '/namespace/namespace1/test-deployment': {
                'createdTime': 1557416644202,
                'createdBy': 'user.test-user',
                'updatedTime': 1665587786186,
                'updatedBy': 'user.test-user',
                'id': 6000,
                'name': 'TEST - Deployment',
                'type': 'DASHBOARD',
                'path': '/6000/test-deployment',
                'fullPath': '/namespace/namespace1/test-deployment',
                'lastVisitedTime': 1657127393987,
                'resourceType': 'file',
                'ownerType': 'namespace',
                'icon': 'd-dashboard-tile',
                'parentPath': '/namespace/namespace1',
                'namespace': 'ssp',
                'loaded': false
            },
        },
        'error': {},
        'loaded': true,
        'dynamicLoaded': {
            'users': true,
            'namespaces': true,
            'favorites': false,
            'recents': false
        },
        'resourceAction': {}
    },
    'NavPanels': {
        'panelTab': 'personal',
        'personalTab': {
            'curPanel': 0,
            'panels': [
                {
                    'index': 0,
                    'folderResource': ':panel-root:',
                    'root': true,
                    'synthetic': true,
                    'locked': true
                }
            ]
        },
        'favoritesTab': {
            'curPanel': 0,
            'panels': [
                {
                    'index': 0,
                    'folderResource': ':user-favorites:',
                    'root': true,
                    'dynamic': true,
                    'synthetic': true,
                    'locked': true
                }
            ]
        },
        'recentTab': {
            'curPanel': 0,
            'panels': [
                {
                    'index': 0,
                    'folderResource': ':user-recent:',
                    'root': true,
                    'dynamic': true,
                    'synthetic': true,
                    'locked': true
                }
            ]
        },
        'usersTab': {
            'curPanel': 0,
            'panels': [
                {
                    'index': 0,
                    'folderResource': ':list-users:',
                    'root': true,
                    'dynamic': true,
                    'synthetic': true,
                    'locked': true
                }
            ]
        },
        'namespacesTab': {
            'curPanel': 0,
            'panels': [
                {
                    'index': 0,
                    'folderResource': ':list-namespaces:',
                    'root': true,
                    'dynamic': true,
                    'synthetic': true,
                    'locked': true
                }
            ]
        },
        'panelAction': {},
        'initialized': true
    }
};

