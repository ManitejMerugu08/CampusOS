const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken); // Protect all ticket routes

router.post('/', requireRole(['student']), ticketController.createTicket);
router.get('/', ticketController.getTickets); // Access logic handled in controller (RBAC)
router.put('/:id', requireRole(['admin', 'faculty', 'student']), ticketController.updateTicketStatus);

module.exports = router;
