const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetable.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Students get their specific timetable
router.get('/student', authenticateToken, requireRole(['student']), timetableController.getStudentTimetable);

// Faculty get their teaching schedule
router.get('/faculty', authenticateToken, requireRole(['faculty']), timetableController.getFacultyTimetable);

// Admin routes
router.get('/all', authenticateToken, requireRole(['admin']), timetableController.getAllTimetable);
router.post('/', authenticateToken, requireRole(['admin']), timetableController.createEntry);
router.put('/:id', authenticateToken, requireRole(['admin']), timetableController.updateEntry);
router.delete('/:id', authenticateToken, requireRole(['admin']), timetableController.deleteEntry);

module.exports = router;
