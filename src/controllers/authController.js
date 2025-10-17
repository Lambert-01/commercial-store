const User = require('../models/User');
const logger = require('../utils/logger');

exports.getLogin = (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🔑 GET /login - Login page requested`, {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.render('pages/login', {
    requestId,
    title: 'Login - Ecommerce Rwanda'
  });
};

exports.postLogin = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🔐 POST /login - Login attempt`, {
    email: req.body.email,
    hasPassword: !!req.body.password,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      logger.warn(`[${requestId}] ⚠️ Missing login credentials`, {
        hasEmail: !!email,
        hasPassword: !!password,
        redirectUrl: '/login'
      });
      return res.render('pages/login', {
        error: 'Email and password are required',
        requestId
      });
    }

    // Check for demo login
    if (password === 'demo123' && ['demo@customer.com', 'demo@supplier.com', 'demo@admin.com'].includes(email)) {
      logger.info(`[${requestId}] 🎭 Demo login detected`, {
        email,
        role: email.includes('customer') ? 'customer' : email.includes('supplier') ? 'supplier' : 'admin'
      });

      // Create or find demo user
      let user = await User.findOne({ email });

      if (!user) {
        // Create demo user if doesn't exist
        const demoUserData = {
          name: email.includes('customer') ? 'Demo Customer' :
                email.includes('supplier') ? 'Demo Supplier' : 'Demo Admin',
          email,
          password: 'demo123',
          role: email.includes('customer') ? 'customer' :
                email.includes('supplier') ? 'supplier' : 'admin'
        };

        user = new User(demoUserData);
        await user.save();

        logger.info(`[${requestId}] 👤 Demo user created`, {
          userId: user._id,
          name: user.name,
          role: user.role
        });
      }

      req.session.user = user;

      logger.info(`[${requestId}] ✅ Demo login successful`, {
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        redirectUrl: '/',
        loginTime: Date.now() - startTime + 'ms'
      });

      return res.redirect('/');
    }

    // Regular login
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`[${requestId}] ❌ User not found`, {
        email,
        redirectUrl: '/login'
      });
      return res.render('pages/login', {
        error: 'Invalid email or password',
        requestId
      });
    }

    if (!(await user.comparePassword(password))) {
      logger.warn(`[${requestId}] ❌ Invalid password`, {
        email,
        userId: user._id,
        redirectUrl: '/login'
      });
      return res.render('pages/login', {
        error: 'Invalid email or password',
        requestId
      });
    }

    req.session.user = user;

    logger.info(`[${requestId}] ✅ Login successful`, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      redirectUrl: '/',
      loginTime: Date.now() - startTime + 'ms'
    });

    res.redirect('/');

  } catch (error) {
    logger.error(`[${requestId}] 💥 Login error`, {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.render('pages/login', {
      error: 'Login failed. Please try again.',
      requestId
    });
  }
};

exports.getRegister = (req, res) => {
  res.render('pages/register');
};

exports.postRegister = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = new User({ name, email, password, role });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.render('pages/register', { error: 'Registration failed' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};