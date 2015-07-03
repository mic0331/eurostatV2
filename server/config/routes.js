var status    = require('../utilities/status.js');

module.exports = function(app) {
    var apiBaseUrl = "/api/v1";

    app.get('/uptime', status());    

    app.use(apiBaseUrl + '/eurostat', require('../api/eurostat'));
    app.use(apiBaseUrl + '/mapping', require('../api/mapping'));
    app.use(apiBaseUrl + '/ratio', require('../api/ratio'));

    app.all(apiBaseUrl + '/*', function(req, res, next) {
        //res.send(404);
        var error = new Error('Cannot ' + req.method + ' ' + req.url);
        error.statusCode = 404;
        next(error);
    });

    app.get('*', function(req, res) {
        res.render('index', {
            env: process.env.NODE_ENV // this is not used
        });
    });
};