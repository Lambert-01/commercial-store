const User = require('../models/User');

exports.getLogin = (req, res) => {
  res.render('pages/login');
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('pages/login', { error: 'Invalid credentials' });
    }
    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    res.render('pages/login', { error: 'Login failed' });
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