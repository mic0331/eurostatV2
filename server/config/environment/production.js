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
    db: 'mongodb://mic0331:eurostatv2@ds043952.mongolab.com:43952/eurostatv2'
};