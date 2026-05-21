const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

/**
 * POST /api/category
 * Create custom category for merchant
 */
router.post('/', categoryController.createCategory);

/**
 * GET /api/category
 * Get all categories for merchant
 */
router.get('/', categoryController.getCategories);

/**
 * PUT /api/category/:categoryId
 * Update category
 */
router.put('/:categoryId', categoryController.updateCategory);

/**
 * DELETE /api/category/:categoryId
 * Delete category
 */
router.delete('/:categoryId', categoryController.deleteCategory);

module.exports = router;
