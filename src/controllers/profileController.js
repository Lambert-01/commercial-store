const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

class ProfileController {
  // GET profile page
  async getProfile(req, res) {
    try {
      const userId = req.session.user._id;

      // Get user data
      const user = await User.findById(userId);

      // Get recent orders
      const recentOrders = await Order.find({ customer: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('items.product', 'name price');

      res.render('pages/profile', {
        title: 'My Profile - Ecommerce Rwanda',
        user: user,
        recentOrders: recentOrders,
        requestId: `profile_${Date.now()}`
      });
    } catch (error) {
      console.error('Profile page error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to load profile',
        error: error
      });
    }
  }

  // POST update profile
  async updateProfile(req, res) {
    try {
      const userId = req.session.user._id;
      const { name, email, phone, city, country, address } = req.body;

      // Check if email is already taken by another user
      if (email !== req.session.user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.render('pages/profile', {
            title: 'My Profile - Ecommerce Rwanda',
            user: req.session.user,
            error: 'Email address is already in use',
            requestId: `profile_${Date.now()}`
          });
        }
      }

      // Update user profile
      await User.findByIdAndUpdate(userId, {
        name,
        email,
        phone,
        city,
        country,
        address
      });

      // Update session user data
      req.session.user.name = name;
      req.session.user.email = email;
      req.session.user.phone = phone;
      req.session.user.city = city;
      req.session.user.country = country;
      req.session.user.address = address;

      res.render('pages/profile', {
        title: 'My Profile - Ecommerce Rwanda',
        user: req.session.user,
        success: 'Profile updated successfully',
        requestId: `profile_${Date.now()}`
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to update profile',
        error: error
      });
    }
  }

  // POST change password
  async changePassword(req, res) {
    try {
      const userId = req.session.user._id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate new password match
      if (newPassword !== confirmPassword) {
        return res.render('pages/profile', {
          title: 'My Profile - Ecommerce Rwanda',
          user: req.session.user,
          error: 'New passwords do not match',
          requestId: `profile_${Date.now()}`
        });
      }

      // Get current user
      const user = await User.findById(userId);

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.render('pages/profile', {
          title: 'My Profile - Ecommerce Rwanda',
          user: user,
          error: 'Current password is incorrect',
          requestId: `profile_${Date.now()}`
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await User.findByIdAndUpdate(userId, { password: hashedPassword });

      res.render('pages/profile', {
        title: 'My Profile - Ecommerce Rwanda',
        user: user,
        success: 'Password changed successfully',
        requestId: `profile_${Date.now()}`
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to change password',
        error: error
      });
    }
  }
}

module.exports = new ProfileController();