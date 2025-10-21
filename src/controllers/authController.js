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

    // Check for demo login (using actual seeded accounts)
    const demoCredentials = {
      'customer@customer.rw': { role: 'customer', name: 'Demo Customer' },
      'supplier@kigalicoffee.rw': { role: 'supplier', name: 'Demo Coffee Supplier' },
      'supplier@rwandanfashion.rw': { role: 'supplier', name: 'Demo Fashion Supplier' },
      'supplier@localmarket.rw': { role: 'supplier', name: 'Demo Market Supplier' },
      'admin@ecommerce.rw': { role: 'admin', name: 'Demo Admin' }
    };

    if (password === 'customer123' && demoCredentials[email]) {
      logger.info(`[${requestId}] 🎭 Demo login detected`, {
        email,
        role: demoCredentials[email].role
      });

      // Create or find demo user
      let user = await User.findOne({ email });

      if (!user) {
        // Create demo user if doesn't exist
        const demoUserData = {
          name: demoCredentials[email].name,
          email,
          password: password,
          role: demoCredentials[email].role,
          phone: '+250788000000',
          verified: true
        };

        // Add supplier-specific data
        if (demoUserData.role === 'supplier') {
          demoUserData.storeName = `${demoUserData.name} Store`;
          demoUserData.storeDescription = 'Demo store for testing purposes';
          demoUserData.businessCategory = 'other';
        }

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

    // Role-based redirect after login
    let redirectUrl = '/';
    switch (user.role) {
      case 'admin':
        redirectUrl = '/admin-portal';
        break;
      case 'supplier':
        redirectUrl = '/supplier/dashboard';
        break;
      case 'customer':
      default:
        redirectUrl = '/';
        break;
    }

    logger.info(`[${requestId}] ✅ Login successful`, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      redirectUrl,
      loginTime: Date.now() - startTime + 'ms'
    });

    res.redirect(redirectUrl);

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
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 📝 POST /register - Registration attempt`, {
    email: req.body.email,
    role: req.body.role,
    timestamp: new Date().toISOString()
  });

  try {
    const {
      name, email, password, role,
      phone, address, city, country,
      nationality, dateOfBirth,
      storeName, storeDescription, businessCategory, businessId
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      logger.warn(`[${requestId}] ⚠️ Missing required registration fields`, {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasRole: !!role
      });
      return res.render('pages/register', {
        error: 'Please fill in all required fields',
        requestId
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`[${requestId}] ⚠️ Email already exists`, {
        email,
        redirectUrl: '/register'
      });
      return res.render('pages/register', {
        error: 'Email address is already registered',
        requestId
      });
    }

    // Prepare user data based on role
    const userData = {
      name,
      email,
      password,
      role,
      phone: phone || '',
      address: address || '',
      city: city || '',
      country: country || 'Rwanda'
    };

    // Add customer-specific fields
    if (role === 'customer') {
      userData.nationality = nationality || '';
      if (dateOfBirth) {
        userData.dateOfBirth = new Date(dateOfBirth);
      }
    }

    // Add supplier-specific fields
    if (role === 'supplier') {
      if (!storeName) {
        return res.render('pages/register', {
          error: 'Store name is required for suppliers',
          requestId
        });
      }

      userData.storeName = storeName;
      userData.storeDescription = storeDescription || '';
      userData.businessCategory = businessCategory || '';
      userData.businessId = businessId || '';
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    logger.info(`[${requestId}] ✅ Registration successful`, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      registrationTime: Date.now() - startTime + 'ms'
    });

    // Role-based redirect after registration
    let redirectUrl = '/login';
    let successMessage = 'Registration successful! Please login.';

    if (role === 'supplier') {
      redirectUrl = '/login';
      successMessage = 'Supplier registration successful! Please login to access your dashboard.';
    } else {
      redirectUrl = '/login';
      successMessage = 'Registration successful! Please login to access your dashboard.';
    }

    // Redirect to login with success message (you can implement flash messages)
    res.redirect(`${redirectUrl}?success=${encodeURIComponent(successMessage)}`);

  } catch (error) {
    logger.error(`[${requestId}] 💥 Registration error`, {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      role: req.body?.role,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.render('pages/register', {
      error: 'Registration failed. Please try again.',
      requestId
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};