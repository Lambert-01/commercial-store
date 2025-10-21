const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

class AdminController {
  // Dashboard
  async getDashboard(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const pendingProducts = await Product.find({ approved: false }).populate('supplier', 'name');

      res.render('pages/admin-dashboard', {
        title: 'Admin Dashboard - Ecommerce Rwanda',
        totalUsers,
        totalProducts,
        totalOrders,
        pendingProducts
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to load admin dashboard',
        error
      });
    }
  }

  // Products Management
  async getProducts(req, res) {
    try {
      const products = await Product.find().populate('supplier', 'name');
      res.render('pages/admin-products', {
        title: 'Products Management - Ecommerce Rwanda',
        products
      });
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async approveProduct(req, res) {
    try {
      await Product.findByIdAndUpdate(req.body.productId, { approved: true });
      res.redirect('/admin');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async rejectProduct(req, res) {
    try {
      await Product.findByIdAndDelete(req.body.productId);
      res.redirect('/admin');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  // Users Management
  async getUsers(req, res) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.render('pages/admin-users', {
        title: 'Users Management - Ecommerce Rwanda',
        users
      });
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async getUserDetails(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).render('pages/404');
      }

      res.render('pages/admin-user-details', {
        title: 'User Details - Ecommerce Rwanda',
        user
      });
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      await User.findByIdAndUpdate(req.params.id, { role });
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async suspendUser(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { status: 'suspended' });
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async activateUser(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { status: 'active' });
      res.redirect('/admin/users');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  // Suppliers Management
  async getSuppliers(req, res) {
    try {
      const suppliers = await User.find({ role: 'supplier' }).sort({ createdAt: -1 });
      res.render('pages/admin-suppliers', {
        title: 'Suppliers Management - Ecommerce Rwanda',
        suppliers
      });
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async verifySupplier(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { verified: true });
      res.redirect('/admin/suppliers');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async suspendSupplier(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { status: 'suspended' });
      res.redirect('/admin/suppliers');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  // Orders Management
  async getOrders(req, res) {
    try {
      const orders = await Order.find()
        .populate('customer', 'name email')
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });

      res.render('pages/admin-orders', {
        title: 'Orders Management - Ecommerce Rwanda',
        orders
      });
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.status = status;
      if (status === 'delivered') {
        order.deliveredAt = new Date();
      }

      await order.save();
      res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update order' });
    }
  }

  // System Settings
  async getSettings(req, res) {
    try {
      // Get current settings (you can expand this)
      const settings = {
        siteName: 'Ecommerce Rwanda',
        maintenanceMode: false,
        allowRegistration: true
      };

      res.render('pages/admin-settings', {
        title: 'System Settings - Ecommerce Rwanda',
        settings
      });
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  async updateSettings(req, res) {
    try {
      // Update settings logic here
      res.redirect('/admin/settings');
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }

  // Analytics
  async getAnalytics(req, res) {
    try {
      const analytics = {
        totalRevenue: 125000,
        totalOrders: await Order.countDocuments(),
        totalUsers: await User.countDocuments(),
        totalProducts: await Product.countDocuments()
      };

      res.render('pages/admin-analytics', {
        title: 'Analytics - Ecommerce Rwanda',
        analytics
      });
    } catch (error) {
      res.status(500).render('pages/error', { error });
    }
  }
}

module.exports = new AdminController();