const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

/**
 * POST /api/notification/sms
 * Send SMS notification
 */
router.post('/sms', notificationController.sendSMSNotification);

/**
 * GET /api/notification/history
 * Get notification history
 */
router.get('/history', notificationController.getNotificationHistory);

module.exports = router;
