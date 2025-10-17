const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');
const logger = require('../utils/logger');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

// Demo routes for quick access
router.get('/demo/:role', async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🎭 GET /demo/${req.params.role} - Demo access requested`, {
    role: req.params.role,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  try {
    const { role } = req.params;

    // Validate role
    if (!['customer', 'supplier', 'admin'].includes(role)) {
      logger.warn(`[${requestId}] ⚠️ Invalid demo role requested`, {
        requestedRole: role,
        validRoles: ['customer', 'supplier', 'admin'],
        redirectUrl: '/login'
      });
      return res.redirect('/login?error=invalid-demo-role');
    }

    // Demo user data
    const demoUsers = {
      customer: { email: 'demo@customer.com', name: 'Demo Customer' },
      supplier: { email: 'demo@supplier.com', name: 'Demo Supplier' },
      admin: { email: 'demo@admin.com', name: 'Demo Admin' }
    };

    const demoUser = demoUsers[role];

    // Check if demo user exists, create if not
    let user = await User.findOne({ email: demoUser.email });

    if (!user) {
      logger.info(`[${requestId}] 👤 Creating demo ${role} user`);
      user = new User({
        name: demoUser.name,
        email: demoUser.email,
        password: 'demo123',
        role: role
      });
      await user.save();
    }

    // Set session
    req.session.user = user;

    logger.info(`[${requestId}] ✅ Demo ${role} login successful`, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      redirectUrl: role === 'admin' ? '/admin-portal' : '/',
      processingTime: Date.now() - startTime + 'ms'
    });

    // Redirect based on role
    if (role === 'admin') {
      res.redirect('/admin-portal');
    } else {
      res.redirect('/');
    }

  } catch (error) {
    logger.error(`[${requestId}] 💥 Demo access error`, {
      error: error.message,
      stack: error.stack,
      requestedRole: req.params.role,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.redirect('/login?error=demo-access-failed');
  }
});

module.exports = router;