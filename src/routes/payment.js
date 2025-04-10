const express = require('express');
const router = express.Router();
const paymentController = require('../app/controller/PaymentController');



router.get('/cash', paymentController.cashMethod);
router.get('/momo', paymentController.momoMethod);
router.post('/vnpay', paymentController.vnpayMethod);
router.post('/momo-return', paymentController.momoReturn);
router.get('/vnpay-return', paymentController.vnpayReturn);
 //ipn
router.post('/check-transaction-status', paymentController.transactionStatus);

module.exports = router;