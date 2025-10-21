const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

// All profile routes require authentication
router.use(authMiddleware());

// GET profile page
router.get('/', profileController.getProfile);

// POST update profile
router.post('/update', profileController.updateProfile);

// POST change password
router.post('/change-password', profileController.changePassword);

module.exports = router;