const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// All admin routes require authentication and admin role
router.use(authMiddleware(['admin']));

// Dashboard
router.get('/', adminController.getDashboard);
router.get('/dashboard', adminController.getDashboard);

// Products Management
router.get('/products', adminController.getProducts);
router.post('/approve-product', adminController.approveProduct);
router.post('/reject-product', adminController.rejectProduct);
router.get('/products/pending', adminController.getPendingProducts);

// Users Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.post('/users/:id/update-role', adminController.updateUserRole);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/activate', adminController.activateUser);

// Suppliers Management
router.get('/suppliers', adminController.getSuppliers);
router.get('/suppliers/:id', adminController.getSupplierDetails);
router.post('/suppliers/:id/verify', adminController.verifySupplier);
router.post('/suppliers/:id/suspend', adminController.suspendSupplier);

// Orders Management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.post('/orders/:id/update-status', adminController.updateOrderStatus);

// System Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

// Analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;