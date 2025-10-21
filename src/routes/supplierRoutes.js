const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middlewares/authMiddleware');

// All supplier routes require authentication and supplier role
router.use(authMiddleware(['supplier']));

// Dashboard
router.get('/dashboard', supplierController.getDashboard);

// Products Management
router.get('/products', supplierController.getProducts);
router.get('/add-product', supplierController.getAddProduct);
router.post('/add-product', supplierController.postAddProduct);

// Orders Management
router.get('/orders', supplierController.getOrders);
router.post('/orders/:id/update-status', supplierController.updateOrderStatus);

// Store Management
router.get('/store', supplierController.getStore);
router.post('/store', supplierController.updateStore);

// Suppliers Directory (Public)
router.get('/suppliers', supplierController.getSuppliersDirectory);

module.exports = router;