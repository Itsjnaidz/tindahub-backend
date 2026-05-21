const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/auth
 * Auth route info
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Auth service is running',
    availableRoutes: ['/generate-otp', '/verify-otp', '/logout'],
    method: 'POST',
  });
});

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
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
