'use strict';

var express = require('express'),
    controller = require('./mapping.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/countries', controller.getCountries);

module.exports = router;