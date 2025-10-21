const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authMiddleware = require('../middlewares/authMiddleware');

// All checkout routes require authentication
router.use(authMiddleware());

// GET checkout page
router.get('/', checkoutController.getCheckout);

// POST process checkout
router.post('/process', checkoutController.processCheckout);

// GET payment pending page
router.get('/payment-pending/:orderId', checkoutController.getPaymentPending);

// POST payment webhook (for mobile money callbacks)
router.post('/webhook/:provider', checkoutController.handlePaymentWebhook);

module.exports = router;