const express = require('express');
const router = express.Router();
const paymentController = require('../app/controller/PaymentController');



router.get('/cash', paymentController.cashMethod);
router.get('/online', paymentController.momoMethod);
router.post('/callback', paymentController.updatePaymentStatus); //ipn
router.post('/check-transaction-status', paymentController.transactionStatus);

module.exports = router;