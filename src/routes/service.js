const express = require('express');
const router = express.Router();
const serviceController = require('../app/controller/ServiceController');



router.use('/::slug', serviceController.show);

router.use('/', serviceController.index);

module.exports = router;