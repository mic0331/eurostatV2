var express             = require('express')
    , stylus            = require('stylus')
    , logger            = require('morgan')
    , bodyParser        = require('body-parser')
    , compress          = require('compression')
    , url               = require('url')
    , cookieParser      = require('cookie-parser')
    , colors            = require('colors')
    , responseTime      = require('response-time')
    , compression       = require('compression')
    , methodOverride    = require('method-override');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

var allowCrossDomain = function(req, res, next) {
        // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
   next();
}

module.exports = function(app, config) {
    function compile(str, path) {
        return stylus(str).set('filename', path);
    }
    app.set('views', config.rootPath + '/server/views');
    app.set('view engine', 'jade');
    app.use(compression());
    app.use(logger('dev'));
    app.use(compress());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(stylus.middleware({
            src: config.rootPath + '/public',
            compile: compile
    }));
    app.use(responseTime(5));
    app.use(allowCrossDomain);
    app.use(express.static(config.rootPath + '/public'));
};