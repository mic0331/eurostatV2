/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /mapping            ->  index
 */

'use strict';

var Mapping  = require('./mapping.model');

function handleError(res, err) {
    return res.status(500).json(err);
}

// Get List of mappings.
exports.index = function(req, res) {
    Mapping.find({}).exec(function(err, collection) {
        if(err) { return handleError(res, err); }
        return res.status(200).json(collection);
    })
};

// Get List of countries.
exports.getCountries = function(req, res) {
    Mapping.find({
        'feature': "country", 
    })
    .sort({'codes.label' :  -1})
    .select('codes')
    .exec(function (err, data) {
        if(err) { return handleError(res, err); }
        if(!data) { return res.status(404).end(); }
        return res.json(data).end();
    });
};