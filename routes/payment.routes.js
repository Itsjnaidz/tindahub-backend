const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

/**
 * POST /api/payment/gcash
 * Process GCash payment
 */
router.post('/gcash', paymentController.processGCashPayment);

/**
 * POST /api/payment/maya
 * Process Maya payment
 */
router.post('/maya', paymentController.processMayaPayment);

/**
 * GET /api/payment/transactions/:orderId
 * Get transaction history for order
 */
router.get('/transactions/:orderId', paymentController.getTransactionHistory);

module.exports = router;
