// ============================================================================
// Controller: Authentication (Signup, Login, Admin Login)
// ============================================================================
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Generate signed JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/v1/auth/signup
 *
 * Registers a new normal USER.
 * Note: Admin users CANNOT be created via public signup. Role is enforced as 'USER'.
 */
async function signup(req, res) {
  try {
    const { full_name, email, password } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────
    if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.',
      });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Check if user already exists ──────────────────────────────────────
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // ── Enforce USER role for public signup ────────────────────────────────
    const newUser = await User.create({
      full_name: full_name.trim(),
      email: normalizedEmail,
      password,
      role: 'USER', // Always forced to USER
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: newUser.toJSON(),
      },
    });
  } catch (error) {
    console.error('✖  User signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.errors?.[0]?.message || 'Internal server error during registration.',
    });
  }
}

/**
 * POST /api/v1/auth/login
 *
 * Logs in a user (USER or ADMIN).
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('✖  User login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
}

/**
 * POST /api/v1/auth/admin/login
 *
 * Dedicated login endpoint for administrators.
 * Rejects normal users with 403 Forbidden.
 */
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify ADMIN role
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This portal is restricted to administrator accounts only.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('✖  Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during admin login.',
    });
  }
}

/**
 * GET /api/v1/auth/me
 *
 * Returns profile of the currently authenticated user
 */
async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
  });
}

module.exports = {
  signup,
  login,
  adminLogin,
  getMe,
};
