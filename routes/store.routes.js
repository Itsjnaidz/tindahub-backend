const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

/**
 * POST /api/store/register
 * Register new store/merchant
 */
router.post('/register', storeController.registerStore);

/**
 * GET /api/store/:storeId
 * Get store information
 */
router.get('/:storeId', storeController.getStoreInfo);

/**
 * PUT /api/store/:storeId
 * Update store information
 */
router.put('/:storeId', storeController.updateStore);

module.exports = router;
