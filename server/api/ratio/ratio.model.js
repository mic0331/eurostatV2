'use strict';

var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    _           = require('lodash');

var RatioSchema = new Schema({
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
    measure: [{
        year: {
            NET: {type: Number},
            TAX: {type: Number},
            tax_ratio: {type: Number},
        }
    }]
});

module.exports = mongoose.model('ratio', RatioSchema);