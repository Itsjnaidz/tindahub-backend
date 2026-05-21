const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

/**
 * POST /api/order
 * Create new order
 */
router.post('/', orderController.createOrder);

/**
 * GET /api/order
 * Get user's orders
 */
router.get('/', orderController.getUserOrders);

/**
 * GET /api/order/:orderId
 * Get order by ID
 */
router.get('/:orderId', orderController.getOrderById);

/**
 * PUT /api/order/:orderId/status
 * Update order status (state machine)
 */
router.put('/:orderId/status', orderController.updateOrderStatus);

/**
 * PUT /api/order/:orderId/cancel
 * Cancel order
 */
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
