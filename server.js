const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import custom middleware and services
const logger = require('./src/utils/logger');
const {
  securityHeaders,
  generalLimiter,
  authLimiter,
  uploadLimiter,
  csrfProtection,
  sanitizeInput,
  preventSqlInjection,
  preventXSS,
} = require('./src/middlewares/security');

// Import database configuration
const connectDB = require('./src/config/db');

const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware (helmet must be first)
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true,
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware with limits
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 10000
}));
app.use(express.json({
  limit: '10mb'
}));

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'ecommerce.sid', // Don't use default session name
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native',
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'strict',
  },
}));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Static files middleware with caching headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global template variables
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === 'admin';
  res.locals.isSupplier = req.session.user?.role === 'supplier';
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  next();
});

// Security middleware
app.use(sanitizeInput);
app.use(preventSqlInjection);
app.use(preventXSS);

// CSRF protection (except for API routes)
app.use((req, res, next) => {
  // Skip CSRF for API routes and webhooks
  if (req.path.startsWith('/api/') || req.path.startsWith('/webhook/')) {
    return next();
  }
  csrfProtection(req, res, next);
});

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/auth', authLimiter);

// Import routes
app.use('/', require('./src/routes/authRoutes'));
app.use('/products', require('./src/routes/productRoutes'));
app.use('/cart', require('./src/routes/cartRoutes'));
app.use('/supplier', require('./src/routes/supplierRoutes'));
app.use('/admin', require('./src/routes/adminRoutes'));

// API routes (for mobile app, AJAX calls, etc.)
app.use('/api/auth', require('./src/routes/api/authRoutes'));
app.use('/api/products', require('./src/routes/api/productRoutes'));
app.use('/api/cart', require('./src/routes/api/cartRoutes'));
app.use('/api/orders', require('./src/routes/api/orderRoutes'));
app.use('/api/payments', require('./src/routes/api/paymentRoutes'));

// Webhook routes for payment providers
app.use('/webhook/mtn', require('./src/routes/webhooks/mtnWebhook'));
app.use('/webhook/airtel', require('./src/routes/webhooks/airtelWebhook'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).render('pages/404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.session.user?.id,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).render('pages/error', {
    title: 'Error',
    message: isDevelopment ? err.message : 'Something went wrong!',
    error: isDevelopment ? err : {},
    status: err.status || 500,
  });
});

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed.');

    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force close server after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
}

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server gracefully
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;