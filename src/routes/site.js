const express = require('express');
const router = express.Router();
const siteController = require('../app/controller/SiteController');

router.get('/contact', siteController.contact);

router.get('/login', siteController.showLogin);

router.post('/login', siteController.login);

router.get('/logout', siteController.logout);

router.post('/signup', siteController.signup);

router.get('/signup', siteController.showSignup);

router.get('/resetpass', siteController.resetpass);

router.get('/chat', siteController.chat);


router.get('/', siteController.index);

module.exports = router;