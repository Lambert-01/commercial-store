/**
 * Role-based middleware for Ecommerce Rwanda
 * Provides flexible role-based access control
 */

/**
 * Middleware to require specific role(s)
 * @param {string|array} roles - Single role or array of roles allowed
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    // Must be authenticated
    if (!req.session.user) {
      return res.redirect('/login');
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Check if user has required role
    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).render('pages/error', {
        title: 'Access Denied - Ecommerce Rwanda',
        message: 'You do not have permission to access this page.',
        error: { status: 403 }
      });
    }

    next();
  };
};

/**
 * Middleware to require authentication (any logged-in user)
 */
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

/**
 * Middleware for admin-only routes
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware for supplier-only routes
 */
const requireSupplier = requireRole('supplier');

/**
 * Middleware for customer-only routes
 */
const requireCustomer = requireRole('customer');

/**
 * Middleware for authenticated users (suppliers and customers, but not admins)
 */
const requireUser = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.role === 'admin') {
    return res.status(403).render('pages/error', {
      title: 'Access Denied - Ecommerce Rwanda',
      message: 'Admin users should use the admin portal.',
      error: { status: 403 }
    });
  }

  next();
};

/**
 * Middleware to redirect based on role after login
 */
const redirectByRole = (req, res, next) => {
  if (req.session.user) {
    const role = req.session.user.role;

    switch (role) {
      case 'admin':
        return res.redirect('/admin-portal');
      case 'supplier':
        return res.redirect('/supplier/dashboard');
      case 'customer':
      default:
        return res.redirect('/');
    }
  }
  next();
};

module.exports = {
  requireRole,
  requireAuth,
  requireAdmin,
  requireSupplier,
  requireCustomer,
  requireUser,
  redirectByRole
};