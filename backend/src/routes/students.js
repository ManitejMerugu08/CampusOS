const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Only Faculty and Admins can view the directory
router.get('/', requireRole(['faculty', 'admin']), studentController.getStudents);
router.get('/:id', requireRole(['faculty', 'admin']), studentController.getStudentById);

module.exports = router;
