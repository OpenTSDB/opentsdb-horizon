var utils = require('../lib/utils');

    var oktaSecret =  require('fs').readFileSync("/Users/syed/Desktop/okta_secret.txt").toString();
module.exports = {
    callbackPath: utils.getProperty('okta_callback_path') || '/oauth2/callback',
    clientID: utils.getProperty('okta_client_id') || '0oad31e56t73oaW1L0h7',
    clientSecret: oktaSecret || '',
    cookieDomain: utils.getProperty('okta_cookie_domain') || 'yamas.ouroath.com',
    oktaEnv: utils.getProperty('okta_env') || 'uat',
    timeout: utils.getProperty('okta_timeout'),
    authTimeout: utils.getProperty('okta_auth_timeout'),
    prompt: utils.getProperty('okta_prompt') || 'default',
    serverURL: utils.getProperty('okta_server_url') || 'https://dev-horizon.yamas.ouroath.com:4443'
};