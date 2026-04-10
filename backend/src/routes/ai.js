const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.post('/chat', aiController.handleChat);

module.exports = router;
