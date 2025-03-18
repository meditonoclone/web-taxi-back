const express = require('express');
const router = express.Router();
const multer = require('multer')
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

router.post('/accept-trip', siteController.acceptTrip)

router.post('/book-taxi', multer().none(), siteController.booking);

router.get('/get-newtrips', siteController.getNewTrips)

router.get('/get-newtrips', siteController.getHistoryTrips)

router.get('/get-history-trips', siteController.getHistoryTrips)

// Route gửi email đặt lại mật khẩu
router.post('/forgot-password', siteController.sendResetEmail);

// Route đặt lại mật khẩu
router.post('/reset-password/:token', siteController.resetPassword);

router.get('/reset-password/:token', siteController.createNewPassword);

router.get('/get-trip', siteController.getTrip)

router.get('/', siteController.index);

module.exports = router;