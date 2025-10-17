const express = require('express');
const router = express.Router();
const adminPortalController = require('../controllers/adminPortalController');
const logger = require('../utils/logger');

/**
 * Admin Portal Routes
 * Independent admin interface accessible at /admin-portal
 */

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  if (!req.session.user) {
    logger.warn(`[${requestId}] 🚫 Admin access denied - no session`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      redirectUrl: '/login'
    });
    return res.redirect('/login');
  }

  if (req.session.user.role !== 'admin') {
    logger.warn(`[${requestId}] 🚫 Admin access denied - insufficient role`, {
      userId: req.session.user._id,
      userRole: req.session.user.role,
      requiredRole: 'admin',
      redirectUrl: '/'
    });
    return res.redirect('/');
  }

  logger.info(`[${requestId}] ✅ Admin access granted`, {
    adminId: req.session.user._id,
    adminEmail: req.session.user.email
  });

  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Request logging middleware for admin portal
router.use((req, res, next) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🌐 Admin Portal Request`, {
    method: req.method,
    url: req.originalUrl,
    adminId: req.session.user._id,
    adminEmail: req.session.user.email,
    timestamp: new Date().toISOString()
  });

  // Add request ID to response for tracking
  res.locals.requestId = requestId;
  next();
});

/**
 * Admin Portal Routes
 */

// Dashboard - Main admin overview
router.get('/', adminPortalController.getDashboard);
router.get('/dashboard', adminPortalController.getDashboard);

// User Management
router.get('/users', adminPortalController.getUserManagement);

// Product Approval System
router.get('/products', adminPortalController.getProductApproval);
router.post('/products/approve', adminPortalController.approveProduct);
router.post('/products/reject', adminPortalController.rejectProduct);

// Order Tracking and Management
router.get('/orders', adminPortalController.getOrderTracking);
router.post('/orders/status', adminPortalController.updateOrderStatus);

// API endpoint for dashboard stats (AJAX)
router.get('/api/stats', async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  try {
    const [totalUsers, totalProducts, totalOrders, pendingProducts] = await Promise.all([
      require('../models/User').countDocuments(),
      require('../models/Product').countDocuments(),
      require('../models/Order').countDocuments(),
      require('../models/Product').countDocuments({ approved: false })
    ]);

    const revenueResult = await require('../models/Order').aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingProducts,
      totalRevenue: revenueResult[0]?.total || 0
    };

    logger.info(`[${requestId}] 📊 Dashboard stats API called`, {
      stats,
      adminId: req.session.user._id
    });

    res.json(stats);
  } catch (error) {
    logger.error(`[${requestId}] 💥 Dashboard stats API error`, {
      error: error.message,
      adminId: req.session.user._id
    });

    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handler for admin portal
router.use((error, req, res, next) => {
  const requestId = req.requestId || Math.random().toString(36).substr(2, 9);

  logger.error(`[${requestId}] 💥 Admin portal error`, {
    error: error.message,
    stack: error.stack,
    adminId: req.session.user?._id,
    url: req.originalUrl,
    method: req.method
  });

  res.status(500).render('admin-portal/error', {
    title: 'Admin Portal Error - Ecommerce Rwanda',
    message: 'An error occurred in the admin portal',
    error: process.env.NODE_ENV === 'development' ? error : {},
    status: 500,
    requestId
  });
});

module.exports = router;