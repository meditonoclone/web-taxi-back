const express = require('express');
const router = express.Router();
const adminController = require('../app/controller/AdminController');

router.get('/account', adminController.showAccount);

router.get('/trips', adminController.showTrips);

router.get('/', adminController.index);

module.exports = router;