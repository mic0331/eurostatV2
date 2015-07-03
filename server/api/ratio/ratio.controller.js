/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /ratio            ->  index
 */

'use strict';

var Ratio  = require('./ratio.model');

function handleError(res, err) {
    return res.status(500).json(err);
}

// Get everything.
exports.index = function(req, res) {
    Ratio.find({})
    .select('measure country')
    .exec(function(err, collection) {
        if(err) { return handleError(res, err); }
        return res.status(200).json(collection);
    })
};

// Get ratio per country
exports.getByCountry = function(req, res) {
    Ratio.find({
        'country.code': req.params.id
    })
    .select('measure country')
    .exec(function (err, data) {
        if(err) { return handleError(res, err); }
        if(!data) { return res.status(404).end(); }
        return res.json(data).end();
    });
};