const express = require('express');
const router = express.Router();
const paymentController = require('../app/controller/PaymentController');



router.get('/cast', paymentController.castMethod);
router.get('/online', paymentController.momoMethod);

module.exports = router;