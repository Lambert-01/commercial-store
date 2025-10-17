const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// All order routes require authentication
router.use(authMiddleware());

// Customer order routes
router.get('/history', orderController.getOrderHistory);
router.get('/details/:id', orderController.getOrderDetails);

// Supplier order routes
router.get('/supplier/orders', authMiddleware(['supplier']), orderController.getSupplierOrders);
router.post('/update-status', authMiddleware(['supplier']), orderController.updateOrderStatus);

module.exports = router;