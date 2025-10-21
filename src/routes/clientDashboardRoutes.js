const express = require('express');
const router = express.Router();
const clientDashboardController = require('../controllers/clientDashboardController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Client dashboard route (customers only)
router.get('/', roleMiddleware.requireCustomer, clientDashboardController.getDashboard);

module.exports = router;