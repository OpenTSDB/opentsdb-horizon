
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
  auraUI: 'https://aura.yamas.ouroath.com:443'
};
