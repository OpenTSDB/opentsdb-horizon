
export const APP_TESTING_CONFIG = {
    name: 'OpenTSDB',
    production: false,
    readonly: false,
    queryParams: null,
    debugLevel: 'ERROR',
    uiBranding: {
        logo: {
            imageUrl: 'imageUrl',
            homeUrl: 'homeUrl'
        }
    },
    tsdb_host: 'tsdbHost',
    tsdb_hosts: [],
    webUI: 'webUI',
    configdb: 'configdb',
    metaApi: 'metaApi',
    auraUI: 'auraUI',
    alert_history_url: 'alert_history_url',
    alert: {
        recipient: {
            http: { enable: true },
            email: { enable: true }
        },
    },
    helpLinks: [
        {
            label: 'Help Link',
            href: 'helpUrlLink'
        }
    ],
    modules: {
        dashboard: {
            widget: {
                overrideTime: true
            }
        }
    },
    namespace: {
        enabled: true,
        default: '_default'
    },
    auth: {
        loginURL: 'loginURL',
        heartbeatURL: 'heartbeatURL',
        heartbeatImgURL: 'heartbeatImgURL',
        heartbeatInterval: 600
    }
};
