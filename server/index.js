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
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var utils = require('./lib/utils');

var index = require('./routes/index');

var app = express();


app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// dynamically load the app middleware from middleware directory
// you can add application middleware or want to add/override routing handlers then write the middleware and put the js files under the middleware directory 
// middleware format: https://expressjs.com/en/guide/writing-middleware.html
utils.loadMiddleware(app, __dirname + '/middleware');

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
app.get(/^\/(d|snap|main|user|namespace|a)(.*)/, function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

// routing
app.use('/', index);


module.exports = app;
