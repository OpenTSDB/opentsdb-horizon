
export const environment = {
  production: true,
  queryParams: null,
  debugLevel: 'ERROR',
  tsdbCacheMode: null,
  tsdbSource: null,
  tsdb_host: 'https://metrics.yamas.ouroath.com:443',
  tsdb_hosts: [
    'https://metrics-a.yamas.ouroath.com:443',
    'https://metrics-b.yamas.ouroath.com:443',
    'https://metrics-c.yamas.ouroath.com:443',
    'https://metrics-d.yamas.ouroath.com:443',
    'https://metrics-e.yamas.ouroath.com:443',
    'https://metrics-f.yamas.ouroath.com:443',
    'https://metrics-g.yamas.ouroath.com:443',
  ],
  configdb: 'https://config.yamas.ouroath.com:443/api/v1',
  metaApi: 'https://meta.yamas.ouroath.com:443/api',
  auraUI: 'https://aura.yamas.ouroath.com:443',
  alert: {
    recipient: {
      opsgenie: {
        enable: true,
        guideUrl: 'https://git.ouroath.com/pages/monitoring/yamas_userguide_2.0/BE/opsgenie_plugin/#1-create-an-api-key-for-your-opsgenie-team'
      },
      slack: {
        enable: true,
        guideUrl: 'https://git.ouroath.com/pages/monitoring/yamas_userguide_2.0/BE/slack_integration/#1-request-webhook-permissions-for-your-slack-app'
      },
      oc: {
        enable: true,
        onboardUrl: 'https://vzbuilders.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3Dd0f777c64ffc1b40eee3b47f0210c7b8',
        guideUrl: 'https://git.ouroath.com/pages/monitoring/horizon_userguide/alerts/recipients/#operations-center-oc'
      },
      http: {
        enable: false
      },
      email: {
        enable: true
      }
    }
  },
  splunk_url: 'https://logs.yms.yahoo.com:9999/splunk/en-US/app/search/search?q=search%20index%3Dcorona-alerts%20alert_id%3D'
};
