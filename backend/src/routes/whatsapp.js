const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');

// Twilio webhooks don't use standard JWT tokens. In a real app, verify Twilio Signature middleware here.
// For this prototype, we'll leave the endpoint open to receive POSTs from the sandbox.
router.post('/webhook', express.urlencoded({ extended: false }), whatsappController.handleWebhook);

module.exports = router;
