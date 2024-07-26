const express = require('express');
const router = express.Router();
const serviceController = require('../app/controller/ServiceController');



router.get('/::slug', serviceController.show);

router.get('/', serviceController.index);

module.exports = router;