'use strict';
var utils = require('../lib/utils');
var cookie = require('cookie');

var authUtil = {
    validateOktaCredentials:function(okta) {
        // Make a log entry, before redirecting, for okta errors
        return function (req, res, next) {
    	    if ( req.path == "/heartbeat" ) {
    		  okta.protect({'action':'passthru'})(req, res, function () { next(); });
    	    } else {
        		okta.protect({'action':'redirect'})(req, res, function () {
        		    // All good, pass only okta credentials
                    let cookies      = cookie.parse(req.headers.cookie);
                    let oktaCookies  = 'okta_it=' + cookies['okta_it'] + '; okta_at=' + cookies['okta_at'];
                    /*
        		    let auth         = new Auth();
        		    auth.init({
        			authMode: 'okta',
        			authPrincipal: req.okta,
        			authCookie: oktaCookies
        		    });
        		    req.headers.auth = auth;
                    */
                    req.headers.auth = { cookie:oktaCookies, principal:req.okta.claims.short_id };
        		    next();
        		});
    	    }
        }
    }
};

module.exports = authUtil;
