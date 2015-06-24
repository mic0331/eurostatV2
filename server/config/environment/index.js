'use strict';

var path        = require('path'),
    _           = require('lodash'),
    root        = path.normalize(__dirname + '/../../../');

function requiredProcessEnv(name) {
    if(!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
}

// All configurations will extend these options
// ============================================

var all = {
    env: process.env.NODE_ENV,

    // Root path of server.
    rootPath: root,

    // Server port.
    port: process.env.PORT || 3030,

    // log file location.
    log: root + 'log/error_log'
}

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
        require('./' + process.env.NODE_ENV + '.js') || {});