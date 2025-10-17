const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const logger = require('../utils/logger');

// Request logging middleware for product routes
router.use((req, res, next) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🛍️ Product Route Request`, {
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });

  res.locals.requestId = requestId;
  next();
});

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Supplier store route
router.get('/supplier/:id', productController.getSupplierStore);

module.exports = router;