const express = require('express');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const db = require('../utils/database');
const { generateToken } = require('../utils/jwt');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { authRateLimit } = require('../middleware/auth');

const router = express.Router();

// Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
router.post('/send-otp', [
  authRateLimit,
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone } = req.body;
    
    // Normalize phone number
    const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    const result = await sendOTP(normalizedPhone);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        phone: normalizedPhone
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Verify OTP and login/register user
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', [
  authRateLimit,
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, otp } = req.body;
    
    // Normalize phone number
    const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    // Verify OTP
    const otpResult = verifyOTP(normalizedPhone, otp);
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
        attemptsLeft: otpResult.attemptsLeft
      });
    }
    
    // Find or create user
    let user = await db('users')
      .where({ phone: normalizedPhone })
      .first();
    
    if (!user) {
      // Create new user
      const [newUser] = await db('users')
        .insert({
          phone: normalizedPhone,
          role: 'user',
          status: 'active'
        })
        .returning('*');
      
      user = newUser;
    } else {
      // Update existing user to ensure active status (fix for suspended accounts)
      await db('users')
        .where({ id: user.id })
        .update({ status: 'active' });
      
      // Get updated user data
      user = await db('users').where({ id: user.id }).first();
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        prepaid_balance: user.prepaid_balance,
        payment_mode: user.payment_mode
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Google Sign-in
 * POST /api/auth/google
 */
router.post('/google', [
  authRateLimit,
  body('token')
    .notEmpty()
    .withMessage('Google token is required'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, phone } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Find user by Google ID or email
    let user = await db('users')
      .where({ google_id: googleId })
      .orWhere({ email })
      .first();
    
    if (!user && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for new users',
        requiresPhone: true,
        googleData: { email, name, picture }
      });
    }
    
    if (!user) {
      // Create new user with Google data
      const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      // Check if phone number already exists
      const existingUser = await db('users')
        .where({ phone: normalizedPhone })
        .first();
      
      if (existingUser) {
        // Link Google account to existing user
        await db('users')
          .where({ id: existingUser.id })
          .update({
            google_id: googleId,
            email: email,
            full_name: name || existingUser.full_name,
            profile_image: picture || existingUser.profile_image
          });
        
        user = await db('users').where({ id: existingUser.id }).first();
      } else {
        // Create new user
        const [newUser] = await db('users')
          .insert({
            phone: normalizedPhone,
            email,
            full_name: name,
            google_id: googleId,
            profile_image: picture,
            role: 'user',
            status: 'active'
          })
          .returning('*');
        
        user = newUser;
      }
    } else if (!user.google_id) {
      // Link Google account to existing user
      await db('users')
        .where({ id: user.id })
        .update({
          google_id: googleId,
          email: email,
          full_name: name || user.full_name,
          profile_image: picture || user.profile_image
        });
      
      user = await db('users').where({ id: user.id }).first();
    }
    
    // Generate JWT token
    const jwtToken = generateToken(user);
    
    res.json({
      success: true,
      message: 'Google sign-in successful',
      token: jwtToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        prepaid_balance: user.prepaid_balance,
        payment_mode: user.payment_mode,
        profile_image: user.profile_image
      }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Admin Login with hardcoded credentials
 * POST /api/auth/admin-login
 */
router.post('/admin-login', [
  authRateLimit,
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    
    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@dairydelivery.com';
    const ADMIN_PASSWORD = 'admin123'; // Change this in production!
    
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
    
    // Find admin user in database
    const adminUser = await db('users')
      .where({ email: ADMIN_EMAIL, role: 'admin' })
      .first();
    
    if (!adminUser || adminUser.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or inactive'
      });
    }
    
    // Generate JWT token
    const token = generateToken(adminUser);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: adminUser.id,
        phone: adminUser.phone,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
        status: adminUser.status
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
router.post('/refresh', [
  body('token')
    .notEmpty()
    .withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // This is a simple implementation
    // In production, implement proper refresh token logic with separate refresh tokens
    
    res.json({
      success: false,
      message: 'Refresh token functionality not implemented yet'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;