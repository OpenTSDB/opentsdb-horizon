/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var express = require('express');
var router = express.Router();

router.get("/login", function (req, res) {
  res.status(200).send("<script>window.opener.postMessage('login-success','*');window.close();</script>");
});

router.get("/heartbeat", function (req, res) {
  res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.status(200).json({"status":"ok"});
});

router.get("/heartbeatimg", function (req, res) {
  var gifBuffer = new Buffer('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
  res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Length' : gifBuffer.length, 'Cache-Control': 'private, no-cache, no-store, must-revalidate' });
  res.end(gifBuffer);
});

router.get("/config", function(req, res) {
  try {
    const config = require('../config/app_config.json');
    res.status(200).json(config);
  } catch (e) {
    res.sendStatus(500);
  }
});
module.exports = router;
