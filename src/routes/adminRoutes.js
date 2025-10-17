const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getDashboard);
router.post('/approve-product', adminController.approveProduct);
router.post('/reject-product', adminController.rejectProduct);

module.exports = router;