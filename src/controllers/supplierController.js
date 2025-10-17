const Product = require('../models/Product');

exports.getDashboard = async (req, res) => {
  try {
    const products = await Product.find({ supplier: req.session.user._id });
    res.render('pages/supplier-dashboard', { products });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.getAddProduct = (req, res) => {
  res.render('pages/add-product'); // Assuming you have this view
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
    res.status(500).send('Server error');
  }
};