'use strict';

var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    _           = require('lodash');

var MappingSchema = new Schema({
    feature: {type: String, unique: true},
    description: {type: String},
    codes: [{
            code: {type: String},
            label: {type: String}
        }]
});

module.exports = mongoose.model('mappings', MappingSchema);