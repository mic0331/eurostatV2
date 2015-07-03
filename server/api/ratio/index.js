'use strict';

var express = require('express'),
    controller = require('./ratio.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/country/:id', controller.getByCountry)

module.exports = router;