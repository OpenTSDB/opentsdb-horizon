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

// load middlewares
utils.loadMiddlewares(app, __dirname + '/middlewares');

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
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

// routing
app.use('/', index);


module.exports = app;
