const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * POST /api/auth/generate-otp
 * Generate OTP for user authentication
 */
router.post('/generate-otp', authController.generateOTP);

/**
 * POST /api/auth/verify-otp
 * Verify OTP and authenticate user
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authController.logout);

module.exports = router;
