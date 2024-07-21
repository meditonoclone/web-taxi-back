const express = require('express');
const router = express.Router();
const siteController = require('../app/controller/SiteController');

router.use('/contact', siteController.contact);

router.use('/login', siteController.login);

router.use('/signup', siteController.signup);

router.use('/resetpass', siteController.resetpass);

router.use('/', siteController.index);

module.exports = router;