const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.getAllProducts = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🛍️ GET /products - Products listing requested`, {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    // Get all approved products with supplier information
    const products = await Product.find({ approved: true })
      .populate('supplier', 'name email')
      .sort({ createdAt: -1 });

    logger.info(`[${requestId}] ✅ Products loaded from database`, {
      productCount: products.length,
      renderTime: Date.now() - startTime + 'ms'
    });

    res.render('pages/products', {
      products,
      requestId,
      title: 'Products - Ecommerce Rwanda',
      currentRoute: 'products'
    });

  } catch (error) {
    logger.error(`[${requestId}] 💥 Products listing error`, {
      error: error.message,
      stack: error.stack,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.status(500).render('pages/error', {
      title: 'Products Error - Ecommerce Rwanda',
      message: 'Failed to load products',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500,
      requestId
    });
  }
};

exports.getProductById = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🔍 GET /product/${req.params.id} - Product details requested`, {
    productId: req.params.id,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name email')
      .populate({
        path: 'supplier',
        select: 'name email',
        model: 'User'
      });

    if (!product) {
      logger.warn(`[${requestId}] ⚠️ Product not found`, {
        productId: req.params.id,
        redirectUrl: '/products'
      });
      return res.status(404).render('pages/404', {
        title: 'Product Not Found - Ecommerce Rwanda',
        message: 'The product you are looking for does not exist.',
        requestId
      });
    }

    if (!product.approved) {
      logger.warn(`[${requestId}] ⚠️ Product not approved`, {
        productId: req.params.id,
        productName: product.name,
        redirectUrl: '/products'
      });
      return res.status(404).render('pages/404', {
        title: 'Product Not Available - Ecommerce Rwanda',
        message: 'This product is not currently available.',
        requestId
      });
    }

    // Get related products from the same supplier
    const relatedProducts = await Product.find({
      supplier: product.supplier._id,
      approved: true,
      _id: { $ne: product._id }
    }).limit(4);

    logger.info(`[${requestId}] ✅ Product details loaded`, {
      productId: product._id,
      productName: product.name,
      supplierName: product.supplier?.name,
      relatedProductsCount: relatedProducts.length,
      renderTime: Date.now() - startTime + 'ms'
    });

    res.render('pages/product-details', {
      product,
      relatedProducts,
      requestId,
      title: `${product.name} - Ecommerce Rwanda`,
      currentRoute: 'products'
    });

  } catch (error) {
    logger.error(`[${requestId}] 💥 Product details error`, {
      error: error.message,
      stack: error.stack,
      productId: req.params.id,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.status(500).render('pages/error', {
      title: 'Product Error - Ecommerce Rwanda',
      message: 'Failed to load product details',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500,
      requestId
    });
  }
};

exports.getSupplierStore = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🏪 GET /supplier/${req.params.id} - Supplier store requested`, {
    supplierId: req.params.id,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  try {
    // Find the supplier
    const supplier = await User.findById(req.params.id);
    if (!supplier || supplier.role !== 'supplier') {
      logger.warn(`[${requestId}] ⚠️ Supplier not found or invalid role`, {
        supplierId: req.params.id,
        redirectUrl: '/products'
      });
      return res.status(404).render('pages/404', {
        title: 'Supplier Not Found - Ecommerce Rwanda',
        message: 'The supplier you are looking for does not exist.',
        requestId
      });
    }

    // Get supplier's approved products
    const products = await Product.find({
      supplier: supplier._id,
      approved: true
    }).sort({ createdAt: -1 });

    logger.info(`[${requestId}] ✅ Supplier store loaded`, {
      supplierId: supplier._id,
      supplierName: supplier.name,
      productCount: products.length,
      renderTime: Date.now() - startTime + 'ms'
    });

    res.render('pages/supplier-store', {
      supplier,
      products,
      requestId,
      title: `${supplier.name} - Supplier Store - Ecommerce Rwanda`,
      currentRoute: 'products'
    });

  } catch (error) {
    logger.error(`[${requestId}] 💥 Supplier store error`, {
      error: error.message,
      stack: error.stack,
      supplierId: req.params.id,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.status(500).render('pages/error', {
      title: 'Supplier Error - Ecommerce Rwanda',
      message: 'Failed to load supplier store',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500,
      requestId
    });
  }
};