const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

/**
 * GET /api/analytics/merchant
 * Get merchant analytics data (sums)
 */
router.get('/merchant', analyticsController.getMerchantAnalytics);

/**
 * GET /api/analytics/orders
 * Get order analytics by status
 */
router.get('/orders', analyticsController.getOrderAnalytics);

module.exports = router;
