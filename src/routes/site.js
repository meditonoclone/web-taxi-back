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

// router.get('/chat', siteController.chat);

router.get('/account', siteController.account);

router.post('/delete-trip', siteController.deleteTrip)

router.post('/book-taxi', siteController.booking);

router.get('/', siteController.index);

module.exports = router;