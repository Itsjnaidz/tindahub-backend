const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

/**
 * GET /api/wallet/balance
 * Get merchant wallet balance
 */
router.get('/balance', walletController.getWalletBalance);

/**
 * GET /api/wallet/transactions
 * Get wallet transaction history
 */
router.get('/transactions', walletController.getWalletTransactions);

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from wallet
 */
router.post('/withdraw', walletController.withdrawFunds);

module.exports = router;
