var express = require('express');
var router = express.Router();

router.get("/login", function (req, res) {
  res.status(200).send("<script>window.opener.postMessage('login-success','*');window.close();</script>");
});

router.get("/heartbeat", function (req, res) {
  res.status(200).json({"status":"ok"});
});

router.get("/heartbeatimg", function (req, res) {
  var gifBuffer = new Buffer('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
  res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Length' : gifBuffer.length, 'Cache-Control': 'private, no-cache, no-store, must-revalidate' });
  res.end(gifBuffer);
});

module.exports = router;
