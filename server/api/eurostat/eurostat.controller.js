/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /eurostat            ->  index
 */

'use strict';

var Eurostat  = require('./eurostat.model');

function handleError(res, err) {
    return res.status(500).json(err);
}

// Get everything.
exports.index = function(req, res) {
    Eurostat.find({}).exec(function(err, collection) {
        if(err) { return handleError(res, err); }
        return res.status(200).json(collection);
    })
};

// Get a single country.
exports.getByCountry = function(req, res) {
    Eurostat.find({'country.code': req.params.id}, function (err, data) {
        if(err) { return handleError(res, err); }
        if(!data) { return res.status(404).end(); }
        return res.json(data).end();
    });
};

exports.getNETforA1_50_country = function(req, res) {
    Eurostat.find({
        'ecase.code': "A1_100", // "Single person without children, 100% of AW"
        'currency.code': "EUR",
        'country.code': req.params.id,
        'estruct.code': {$nin: ['GRS', 'SOC', 'FAM', 'TOTAL']}
    })
    .sort({'measure.year' :  -1})
    .select('measure estruct')
    .exec(function (err, data) {
        if(err) { return handleError(res, err); }
        if(!data) { return res.status(404).end(); }
        return res.json(data).end();
    });
};

exports.getNETforA1_50_all_countries = function(req, res) {
    Eurostat.find({
        'ecase.code': "A1_100", // "Single person without children, 100% of AW"
        'currency.code': "EUR",
        'country.code': {$nin: ['EA17', 'EA18', 'EA19', 'EU15', 'EU25', 'EU27','EU28', 'HR', 'CY', 'JP', 'US']}, // croatia and cyprus were removed as we don't have enough info for those courntires
        'estruct.code': {$nin: ['GRS', 'SOC', 'FAM', 'TOTAL']}
    })
    .select('measure')
    .select('estruct country')
    .exec(function (err, data) {
        if(err) { return handleError(res, err); }
        if(!data) { return res.status(404).end(); }
        return res.json(data).end();
    });
};