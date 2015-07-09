// main entry point for the express app

'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var express = require('express');
// based on the environment, we load the required connection string
var config = require('./server/config/environment'); 
var app = express();
var fs = require('fs');
var pjson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
require('./server/config/express')(app, config); // config for express
require('./server/config/mongoose')(config); // config for mongoose
require('./server/config/routes')(app); // router
// this middleware goes last to catches anything left
// in the pipeline and reports to client as an error
if (process.env.NODE_ENV === 'development') {
    var errorHandler = require('./server/utilities/errorHandler');
    app.use(errorHandler({ showMessage: true, dumpExceptions: true, showStack: true, logErrors: config.log }));
}

console.log('env = '+ app.get('env') +
    '\nrootPath = ' + config.rootPath  +
    '\nprocess.cwd = ' + process.cwd() );

// start the server
app.listen(config.port, config.ip, function() {
    console.log('  > > > Express server V.%s listening on ip %s and port %s in %s mode...'.info, pjson.version, config.ip, config.port, app.get('env'));
});
