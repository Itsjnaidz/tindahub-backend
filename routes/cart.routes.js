const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

/**
 * POST /api/cart/add
 * Add item to cart
 */
router.post('/add', cartController.addToCart);

/**
 * GET /api/cart
 * Get user's cart
 */
router.get('/', cartController.getCart);

/**
 * PUT /api/cart/:cartItemId
 * Update cart item quantity
 */
router.put('/:cartItemId', cartController.updateCartItem);

/**
 * DELETE /api/cart/:cartItemId
 * Remove item from cart
 */
router.delete('/:cartItemId', cartController.removeFromCart);

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', cartController.clearCart);

module.exports = router;
