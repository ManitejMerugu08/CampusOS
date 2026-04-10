const express = require('express');
const router = express.Router();
const canteenController = require('../controllers/canteen.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Menu routes
router.get('/menu', canteenController.getMenuItems);                                        // All authenticated
router.get('/menu/all', requireRole(['admin']), canteenController.getAllMenuItems);          // Admin: all items
router.post('/menu', requireRole(['admin']), canteenController.createMenuItem);             // Admin: create
router.put('/menu/:id', requireRole(['admin']), canteenController.updateMenuItem);          // Admin: update
router.delete('/menu/:id', requireRole(['admin']), canteenController.deleteMenuItem);       // Admin: delete

// Order routes
router.post('/orders', requireRole(['student']), canteenController.createOrder);
router.get('/orders', canteenController.getOrders);                                         // role filter in controller
router.put('/orders/:id/status', requireRole(['admin']), canteenController.updateOrderStatus);

module.exports = router;

