const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingProducts = await Product.find({ approved: false }).populate('supplier', 'name');
    res.render('pages/admin-dashboard', { totalUsers, totalProducts, totalOrders, pendingProducts });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.approveProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.body.productId, { approved: true });
    res.redirect('/admin');
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.body.productId);
    res.redirect('/admin');
  } catch (error) {
    res.status(500).send('Server error');
  }
};