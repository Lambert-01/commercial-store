const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.name);
  console.log('🔗 Host:', mongoose.connection.host);
})
.catch(err => {
  console.log('❌ MongoDB connection error:', err.message);
  console.log('💡 Make sure MongoDB is running on localhost:27017');
  console.log('💡 Try: mongod');
});

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simple session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global template variables
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === 'admin';
  res.locals.isSupplier = req.session.user?.role === 'supplier';

  // Set current route for active navigation
  res.locals.currentRoute = req.path.split('/')[1] || 'home';

  // Set default title
  res.locals.title = 'Ecommerce Rwanda - Multi-Vendor Marketplace';

  // Cart item count (placeholder for now)
  res.locals.cartItemCount = 0;

  next();
});

// Basic home route
app.get('/', (req, res) => {
  res.locals.currentRoute = 'home';
  res.locals.title = 'Ecommerce Rwanda - Multi-Vendor Marketplace';
  res.render('pages/index');
});

// Routes
app.use('/', require('./src/routes/authRoutes'));
app.use('/products', require('./src/routes/productRoutes'));
app.use('/cart', require('./src/routes/cartRoutes'));
app.use('/orders', require('./src/routes/orderRoutes'));
app.use('/supplier', require('./src/routes/supplierRoutes'));
app.use('/admin', require('./src/routes/adminRoutes'));

// Admin Portal - Independent admin interface
app.use('/admin-portal', require('./src/routes/adminPortalRoutes'));

// Order processing route (POST from checkout form)
app.post('/orders/process-checkout', require('./src/controllers/orderController').processCheckout);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).render('pages/404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// Simple error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).render('pages/error', {
    title: 'Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {},
    status: err.status || 500,
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }

  console.log(`🚀 Server running successfully on http://localhost:${PORT}`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Main site: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server is ready to accept connections!');
});

module.exports = app;