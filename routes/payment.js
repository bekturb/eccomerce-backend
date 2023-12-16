const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

router.post("/process", PaymentController.postPayment);
router.get("/stripe-apikey", PaymentController.getPaymentData);

module.exports = router;