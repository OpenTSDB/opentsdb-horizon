var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var utils = require('./lib/utils');
var oktaConfig = require('./config/oktaConfig');
var authUtil = require('./middlewares/auth-utils');
var expressOkta = require('express-okta-oath');

var index = require('./routes/index');

var app = express();


app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (utils.getEnv() === 'dev') {
    // implement okta validation
} else if (utils.getProperty('auth_mode') === 'okta') {
  const okta     = new expressOkta.Okta(oktaConfig);
  app.use(okta.callback());
  app.use(authUtil.validateOktaCredentials(okta));
}
else if (utils.getProperty('auth_mode') === 'athenz') {
    // app.use(authUtil.validateAthenzCredentials());
}

app.use(function (req, res, next) {
    // WhitelistFrameAncestors
    res.setHeader('Content-Security-Policy', 'frame-ancestors ' + utils.getWhitelistFrameAncestors().join(' ') );
    next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

app.use('/assets', express.static(path.join(__dirname, 'public/assets'), { maxAge: '1d' }));
app.use(express.static(path.join(__dirname, 'public')));

// for now, we need to get the better regex and re-organize the api url
app.get(/^\/(d|main|a)(.*)/, function (req, res) {
    console.log('CALL ME >>>>> index.html');
    // refresh cookies if the age is >= 10 mins, 
    const now = Math.floor(Date.now() / 1000);
    const claims = req.okta.claims;
    if ( now - claims.iat >= 120 ) {
        const okta     = new expressOkta.Okta(oktaConfig);
        expressOkta.refreshAccessTokenCallback(okta.config, req, res, '', function(details) {
            res.sendFile(path.join(__dirname + '/public/index.html'));
        });
    } else {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    }
});

// routing
app.use('/', index);


module.exports = app;
