const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

router.get('/dashboard', supplierController.getDashboard);
router.get('/add-product', supplierController.getAddProduct);
router.post('/add-product', supplierController.postAddProduct);

module.exports = router;