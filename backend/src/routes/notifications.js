const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
