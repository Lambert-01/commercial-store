const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const products = await Product.find({ supplier: req.session.user._id });
    res.render('pages/supplier-dashboard', {
      title: 'Supplier Dashboard - Ecommerce Rwanda',
      products
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Error',
      message: 'Failed to load dashboard',
      error
    });
  }
};

// Products Management
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ supplier: req.session.user._id });
    res.render('pages/supplier-products', {
      title: 'My Products - Ecommerce Rwanda',
      products
    });
  } catch (error) {
    res.status(500).render('pages/error', { error });
  }
};

// Add Product
exports.getAddProduct = (req, res) => {
  res.render('pages/add-product', {
    title: 'Add Product - Ecommerce Rwanda'
  });
};

exports.postAddProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const product = new Product({
      name,
      description,
      price,
      stock,
      supplier: req.session.user._id,
    });
    await product.save();
    res.redirect('/supplier/dashboard');
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Error',
      message: 'Failed to add product',
      error
    });
  }
};

// Orders Management
exports.getOrders = async (req, res) => {
  try {
    const supplierId = req.session.user._id;

    // Get orders that contain supplier's products
    const orders = await Order.find({})
      .populate('items.product')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    // Filter orders to only include those with supplier's products
    const supplierOrders = orders.filter(order =>
      order.items.some(item => item.product && item.product.supplier.toString() === supplierId.toString())
    );

    res.render('pages/supplier-orders', {
      title: 'My Orders - Ecommerce Rwanda',
      orders: supplierOrders
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Error',
      message: 'Failed to load orders',
      error
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const supplierId = req.session.user._id;

    const order = await Order.findById(id).populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify that this order contains supplier's products
    const hasSupplierProducts = order.items.some(item =>
      item.product && item.product.supplier.toString() === supplierId.toString()
    );

    if (!hasSupplierProducts) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
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
};

// Store Management
exports.getStore = async (req, res) => {
  try {
    const supplier = await User.findById(req.session.user._id);
    const products = await Product.find({ supplier: req.session.user._id });

    res.render('pages/supplier-store-settings', {
      title: 'Store Settings - Ecommerce Rwanda',
      supplier,
      products
    });
  } catch (error) {
    res.status(500).render('pages/error', { error });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const { name, description, email } = req.body;

    await User.findByIdAndUpdate(req.session.user._id, {
      name,
      description,
      email
    });

    res.redirect('/supplier/store');
  } catch (error) {
    res.status(500).render('pages/error', { error });
  }
};

// Suppliers Directory (Public)
exports.getSuppliersDirectory = async (req, res) => {
  try {
    const suppliers = await User.find({ role: 'supplier' })
      .select('name email description')
      .limit(20);

    res.render('pages/suppliers', {
      title: 'Suppliers Directory - Ecommerce Rwanda',
      suppliers
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Error',
      message: 'Failed to load suppliers directory',
      error
    });
  }
};