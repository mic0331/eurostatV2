'use strict';

var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    _           = require('lodash');

var EurostatSchema = new Schema({
    currency: {
        description: {type: String},
        code: {type: String}
    },
    country: {
        description: {type: String},
        code: {type: String}
    },
    ecase: {
        description: {type: String},
        code: {type: String}
    },
    estruct: {
        description: {type: String},
        code: {type: String}
    },
    measure: [{
        year: {type: Number},
        data: {type: Number}
    }]
});

module.exports = mongoose.model('eurn_nt_nets', EurostatSchema);