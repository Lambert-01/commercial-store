const Order = require('../models/Order');
const Product = require('../models/Product');

class ClientDashboardController {
  // GET client dashboard
  async getDashboard(req, res) {
    try {
      const userId = req.session.user._id;

      // Get order statistics
      const totalOrders = await Order.countDocuments({ customer: userId });
      const deliveredOrders = await Order.countDocuments({ customer: userId, status: 'delivered' });
      const pendingOrders = await Order.countDocuments({ customer: userId, status: { $in: ['pending', 'processing', 'shipped'] } });

      // Get recent orders
      const recentOrders = await Order.find({ customer: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('items.product', 'name price');

      // Get featured products (approved products from different suppliers)
      const featuredProducts = await Product.find({ approved: true })
        .populate('supplier', 'name')
        .sort({ createdAt: -1 })
        .limit(8);

      res.render('pages/client-dashboard', {
        title: 'Dashboard - Ecommerce Rwanda',
        user: req.session.user,
        orderStats: {
          totalOrders,
          deliveredOrders,
          pendingOrders
        },
        recentOrders,
        featuredProducts,
        requestId: `client_dashboard_${Date.now()}`
      });
    } catch (error) {
      console.error('Client dashboard error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to load dashboard',
        error: error
      });
    }
  }
}

module.exports = new ClientDashboardController();