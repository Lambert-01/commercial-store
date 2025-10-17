const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if (roles.length && !roles.includes(req.session.user.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
};

module.exports = authMiddleware;