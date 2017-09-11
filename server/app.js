var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
let fs = require('fs');
let session = require('express-session');

var routes = require('./routes/route_app');

var app = express();
var ejs = require('ejs');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('.html', ejs.__express);
app.set('view engine', 'html');// app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'favicon', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'test', //secret的值建议使用随机字符串
    cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
}));

app.use(express.static(path.join(__dirname, 'public')));

//登录请求回调
app.get('/oauth/cas/callback', routes.callback);

//处理登录请求
app.use(routes.authorize);

//处理webpack服务请求
app.get('/__webpack_hmr', function(req, res) {
  res.send('')
});

app.get('/db/getConnection', routes.getConnection);
app.get('/db/schema/list/:db', routes.getSchemaList);
app.get('/db/table/list/:db/:schema', routes.getTableList);
app.post('/db/command', routes.commands);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
