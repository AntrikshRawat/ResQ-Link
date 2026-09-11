// ============================================================================
// Routes: /api/v1/auth
// ============================================================================
const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  adminLogin,
  getMe,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Normal User: Signup & Login
router.post('/signup', signup);
router.post('/login', login);

// Admin User: Login Only (no signup route exists for admin)
router.post('/admin/login', adminLogin);

// Current User Profile
router.get('/me', authenticate, getMe);

module.exports = router;
