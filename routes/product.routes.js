const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

/**
 * POST /api/product
 * Create product
 */
router.post('/', productController.createProduct);

/**
 * GET /api/product
 * Get all products for merchant
 */
router.get('/', productController.getMerchantProducts);

/**
 * GET /api/product/:productId
 * Get product by ID
 */
router.get('/:productId', productController.getProductById);

/**
 * PUT /api/product/:productId
 * Update product
 */
router.put('/:productId', productController.updateProduct);

/**
 * DELETE /api/product/:productId
 * Soft delete product
 */
router.delete('/:productId', productController.deleteProduct);

/**
 * PUT /api/product/:productId/inventory
 * Update product inventory
 */
router.put('/:productId/inventory', productController.updateInventory);

module.exports = router;
