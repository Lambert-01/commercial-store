const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const logger = require('../utils/logger');

/**
 * Admin Portal Controller
 * Independent admin interface for system management
 */
class AdminPortalController {
  constructor() {
    this.requestCounts = new Map();
  }

  /**
   * Admin Portal Dashboard
   */
  async getDashboard(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.info(`[${requestId}] 📊 GET /admin-portal - Admin dashboard requested`, {
      adminId: req.session.user?._id,
      adminEmail: req.session.user?.email,
      timestamp: new Date().toISOString()
    });

    try {
      // Verify admin access
      if (!req.session.user || req.session.user.role !== 'admin') {
        logger.warn(`[${requestId}] ❌ Admin access denied`, {
          userId: req.session.user?._id,
          userRole: req.session.user?.role,
          redirectUrl: '/login'
        });
        return res.redirect('/login');
      }

      logger.info(`[${requestId}] 🔍 Fetching dashboard statistics`);

      // Get dashboard statistics
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        pendingProducts,
        recentOrders,
        pendingApprovals
      ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments({ approved: false }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name'),
        Product.find({ approved: false }).limit(5).populate('supplier', 'name')
      ]);

      // Calculate revenue (sum of all completed orders)
      const revenueResult = await Order.aggregate([
        { $match: { status: { $in: ['completed', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const totalRevenue = revenueResult[0]?.total || 0;

      const stats = {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingProducts,
        totalRevenue,
        recentOrders,
        pendingApprovals
      };

      logger.info(`[${requestId}] ✅ Dashboard data loaded`, {
        stats,
        renderTime: Date.now() - startTime + 'ms'
      });

      res.render('admin-portal/dashboard', {
        title: 'Admin Dashboard - Ecommerce Rwanda',
        stats,
        requestId,
        currentRoute: 'dashboard'
      });

    } catch (error) {
      logger.error(`[${requestId}] 💥 Dashboard error`, {
        error: error.message,
        stack: error.stack,
        adminId: req.session.user?._id,
        processingTime: Date.now() - startTime + 'ms'
      });

      res.status(500).render('admin-portal/error', {
        title: 'Admin Error - Ecommerce Rwanda',
        message: 'Failed to load admin dashboard',
        error: process.env.NODE_ENV === 'development' ? error : {},
        status: 500,
        requestId
      });
    }
  }

  /**
   * User Management Page
   */
  async getUserManagement(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.info(`[${requestId}] 👥 GET /admin-portal/users - User management requested`, {
      adminId: req.session.user?._id,
      timestamp: new Date().toISOString()
    });

    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const [users, totalUsers] = await Promise.all([
        User.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments()
      ]);

      logger.info(`[${requestId}] ✅ Users loaded`, {
        count: users.length,
        page,
        totalUsers,
        renderTime: Date.now() - startTime + 'ms'
      });

      res.render('admin-portal/users', {
        title: 'User Management - Admin Portal',
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        requestId,
        currentRoute: 'users'
      });

    } catch (error) {
      logger.error(`[${requestId}] 💥 User management error`, {
        error: error.message,
        stack: error.stack,
        processingTime: Date.now() - startTime + 'ms'
      });

      res.status(500).render('admin-portal/error', {
        title: 'Admin Error - Ecommerce Rwanda',
        message: 'Failed to load user management',
        error: process.env.NODE_ENV === 'development' ? error : {},
        status: 500,
        requestId
      });
    }
  }

  /**
   * Product Approval Management
   */
  async getProductApproval(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.info(`[${requestId}] 📦 GET /admin-portal/products - Product approval requested`, {
      adminId: req.session.user?._id,
      timestamp: new Date().toISOString()
    });

    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const [pendingProducts, approvedProducts] = await Promise.all([
        Product.find({ approved: false })
          .populate('supplier', 'name email')
          .sort({ createdAt: -1 }),
        Product.find({ approved: true })
          .populate('supplier', 'name email')
          .sort({ createdAt: -1 })
          .limit(10)
      ]);

      logger.info(`[${requestId}] ✅ Products loaded`, {
        pendingCount: pendingProducts.length,
        approvedCount: approvedProducts.length,
        renderTime: Date.now() - startTime + 'ms'
      });

      res.render('admin-portal/products', {
        title: 'Product Approval - Admin Portal',
        pendingProducts,
        approvedProducts,
        requestId,
        currentRoute: 'products'
      });

    } catch (error) {
      logger.error(`[${requestId}] 💥 Product approval error`, {
        error: error.message,
        stack: error.stack,
        processingTime: Date.now() - startTime + 'ms'
      });

      res.status(500).render('admin-portal/error', {
        title: 'Admin Error - Ecommerce Rwanda',
        message: 'Failed to load product approval',
        error: process.env.NODE_ENV === 'development' ? error : {},
        status: 500,
        requestId
      });
    }
  }

  /**
   * Approve Product
   */
  async approveProduct(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.info(`[${requestId}] ✅ POST /admin-portal/products/approve - Product approval`, {
      adminId: req.session.user?._id,
      productId: req.body.productId,
      timestamp: new Date().toISOString()
    });

    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      const product = await Product.findByIdAndUpdate(
        productId,
        { approved: true },
        { new: true }
      ).populate('supplier', 'name email');

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      logger.info(`[${requestId}] ✅ Product approved`, {
        productId,
        productName: product.name,
        supplierId: product.supplier._id,
        supplierName: product.supplier.name
      });

      res.json({
        success: true,
        message: 'Product approved successfully',
        product
      });

    } catch (error) {
      logger.error(`[${requestId}] 💥 Product approval error`, {
        error: error.message,
        stack: error.stack,
        productId: req.body?.productId,
        processingTime: Date.now() - startTime + 'ms'
      });

      res.status(500).json({
        error: 'Failed to approve product',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Reject Product
   */
  async rejectProduct(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.info(`[${requestId}] ❌ POST /admin-portal/products/reject - Product rejection`, {
      adminId: req.session.user?._id,
      productId: req.body.productId,
      timestamp: new Date().toISOString()
    });

    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { productId, reason } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          approved: false,
          rejectionReason: reason || 'No reason provided'
        },
        { new: true }
      ).populate('supplier', 'name email');

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      logger.info(`[${requestId}] ❌ Product rejected`, {
        productId,
        productName: product.name,
        supplierId: product.supplier._id,
        supplierName: product.supplier.name,
        reason
      });

      res.json({
        success: true,
        message: 'Product rejected',
        product
      });

    } catch (error) {
      logger.error(`[${requestId}] 💥 Product rejection error`, {
        error: error.message,
        stack: error.stack,
        productId: req.body?.productId,
        processingTime: Date.now() - startTime + 'ms'
      });

      res.status(500).json({
        error: 'Failed to reject product',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Order Tracking Page
   */
  async getOrderTracking(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.info(`[${requestId}] 📋 GET /admin-portal/orders - Order tracking requested`, {
      adminId: req.session.user?._id,
      timestamp: new Date().toISOString()
    });

    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const [orders, totalOrders] = await Promise.all([
        Order.find()
          .populate('customer', 'name email')
          .populate('items.product', 'name price')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Order.countDocuments()
      ]);

      logger.info(`[${requestId}] ✅ Orders loaded`, {
        count: orders.length,
        page,
        totalOrders,
        renderTime: Date.now() - startTime + 'ms'
      });

      res.render('admin-portal/orders', {
        title: 'Order Tracking - Admin Portal',
        orders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        requestId,
        currentRoute: 'orders'
      });

    } catch (error) {
      logger.error(`[${requestId}] 💥 Order tracking error`, {
        error: error.message,
        stack: error.stack,
        processingTime: Date.now() - startTime + 'ms'
      });

      res.status(500).render('admin-portal/error', {
        title: 'Admin Error - Ecommerce Rwanda',
        message: 'Failed to load order tracking',
        error: process.env.NODE_ENV === 'development' ? error : {},
        status: 500,
        requestId
      });
    }
  }

  /**
   * Update Order Status
   */
  async updateOrderStatus(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.info(`[${requestId}] 🔄 POST /admin-portal/orders/status - Order status update`, {
      adminId: req.session.user?._id,
      orderId: req.body.orderId,
      newStatus: req.body.status,
      timestamp: new Date().toISOString()
    });

    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ error: 'Order ID and status required' });
      }

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      ).populate('customer', 'name email');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      logger.info(`[${requestId}] ✅ Order status updated`, {
        orderId,
        oldStatus: order.status,
        newStatus: status,
        customerId: order.customer._id,
        customerName: order.customer.name
      });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        order
      });

    } catch (error) {
      logger.error(`[${requestId}] 💥 Order status update error`, {
        error: error.message,
        stack: error.stack,
        orderId: req.body?.orderId,
        status: req.body?.status,
        processingTime: Date.now() - startTime + 'ms'
      });

      res.status(500).json({
        error: 'Failed to update order status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Export controller instance
module.exports = new AdminPortalController();