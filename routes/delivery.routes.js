const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');

/**
 * POST /api/delivery/tracking
 * Set tracking info for order
 */
router.post('/tracking', deliveryController.setTrackingInfo);

/**
 * GET /api/delivery/tracking/:orderId
 * Get delivery tracking info
 */
router.get('/tracking/:orderId', deliveryController.getTrackingInfo);

/**
 * PUT /api/delivery/:orderId/status
 * Update order delivery status
 */
router.put('/:orderId/status', deliveryController.updateDeliveryStatus);

module.exports = router;
