'use strict';

// Production specific configuration
// ==================================

module.exports = {
    // Server IP.
    ip: process.env.IP ||
        undefined,

    // server port.
    port: process.env.PORT || 80,

    // Mongodb connection option.
    db: 'mongodb://mic0331:eurostat@ds047672.mongolab.com:47672/eurostat'
};