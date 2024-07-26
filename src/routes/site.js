const express = require('express');
const router = express.Router();
const siteController = require('../app/controller/SiteController');

router.get('/contact', siteController.contact);

router.get('/login', siteController.login);

router.get('/signup', siteController.signup);

router.get('/resetpass', siteController.resetpass);

router.get('/', siteController.index);

module.exports = router;