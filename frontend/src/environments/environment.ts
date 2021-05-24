// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  queryParams: null,
  debugLevel: 'ERROR',
  tsdbCacheMode: null,
  tsdbSource: null,
  tsdb_host: 'https://tsdbr-1-bf2.yamas.ouroath.com:4443',
  tsdb_hosts: [
    'https://metrics-a.yamas.ouroath.com:443',
    'https://metrics-b.yamas.ouroath.com:443',
    'https://metrics-c.yamas.ouroath.com:443',
    'https://metrics-d.yamas.ouroath.com:443',
    'https://metrics-e.yamas.ouroath.com:443',
    'https://metrics-f.yamas.ouroath.com:443',
    'https://metrics-g.yamas.ouroath.com:443',
  ],
  // configdb: 'https://stg-config.yamas.ouroath.com:4443/api/v1',
  configdb: 'https://config.yamas.ouroath.com:443/api/v1',
  // metaApi: 'https://meta.yamas.ouroath.com:443/api',
  metaApi: 'https://stg-metrics.yamas.ouroath.com/api',
  // metaApi: 'https://stg-mt-1-gq1.yamas.ouroath.com/api',
  auraUI: 'https://qa-aura.yamas.ouroath.com:4443',
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
        enable: true
      },
      email: {
        enable: true
      }
    }
  },
  alert_history_url: 'https://logs.yms.yahoo.com:9999/splunk/en-US/app/search/search?q=search%20index%3Dcorona-alerts%20alert_id%3D'
};
