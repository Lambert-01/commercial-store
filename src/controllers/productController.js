const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ approved: true }).populate('supplier', 'name');
    res.render('pages/products', { products });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name');
    if (!product || !product.approved) {
      return res.status(404).send('Product not found');
    }
    res.render('pages/product-details', { product });
  } catch (error) {
    res.status(500).send('Server error');
  }
};