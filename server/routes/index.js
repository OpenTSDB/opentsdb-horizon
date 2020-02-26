var utils = require('../lib/utils');
var expressOkta = require('express-okta-oath');
var oktaConfig = require('../config/oktaConfig');
var express = require('express');
var router = express.Router();

router.get("/dummyapi", function (req, res) {
  res.status(401).json({"status":"bad"});
});


router.get("/login", function (req, res) {
  res.status(200).send("<script>window.opener.postMessage('login-success','*');window.close();</script>");
});

router.get("/heartbeat", function (req, res) {
  if ( utils.getProperty('auth_mode') === 'okta' && req.okta && req.okta.status == "VALID" ) {
      // refresh cookies if the age is >= 10 mins, 
      const now = Math.floor(Date.now() / 1000);
      const claims = req.okta.claims;

      if ( now - claims.iat >= 600 ) {
        const okta     = new expressOkta.Okta(oktaConfig);
        expressOkta.refreshAccessTokenCallback(okta.config, req, res, '', function(details) {
          
          if ( details.status === 'VALID' ) { 
            res.status(200).json({"status":"ok"});
          } else {
            res.status(401).json({"status":"bad"});
          }
        });
      } else {
        res.status(200).json({"status":"ok"});
      }
  } else {
      res.status(401).json({"status":"bad"});
  }
});

router.get("/heartbeatimg", function (req, res) {
  var gifBuffer = new Buffer('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
  res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Length' : gifBuffer.length, 'Cache-Control': 'private, no-cache, no-store, must-revalidate' });
  res.end(gifBuffer);
});

module.exports = router;
