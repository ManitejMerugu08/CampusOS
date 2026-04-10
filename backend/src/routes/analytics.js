const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/overview', requireRole(['admin']), analyticsController.getAnalyticsOverview);

module.exports = router;
