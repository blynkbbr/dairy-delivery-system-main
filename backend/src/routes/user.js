const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../utils/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get user profile
 * GET /api/user/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'phone', 'email', 'full_name', 'address', 'date_of_birth', 'role', 'status', 'prepaid_balance', 'payment_mode', 'profile_image', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update user profile
 * PUT /api/user/profile
 */
router.put('/profile', [
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10 })
    .withMessage('Please enter a complete address'),
  body('date_of_birth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('payment_mode')
    .isIn(['prepaid', 'cash_on_delivery'])
    .withMessage('Invalid payment mode')
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

    const { full_name, email, address, date_of_birth, payment_mode } = req.body;

    // Check if email is already taken by another user
    const existingUser = await db('users')
      .where({ email })
      .andWhere('id', '!=', req.user.id)
      .first();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered with another account'
      });
    }

    // Update user profile
    await db('users')
      .where({ id: req.user.id })
      .update({
        full_name,
        email,
        address,
        date_of_birth,
        payment_mode,
        updated_at: db.fn.now()
      });

    // Get updated user data
    const updatedUser = await db('users')
      .where({ id: req.user.id })
      .select('id', 'phone', 'email', 'full_name', 'address', 'date_of_birth', 'role', 'status', 'prepaid_balance', 'payment_mode', 'profile_image', 'created_at')
      .first();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update delivery address
 * PUT /api/user/address
 */
router.put('/address', [
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10 })
    .withMessage('Please enter a complete address')
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

    const { address } = req.body;

    await db('users')
      .where({ id: req.user.id })
      .update({
        address,
        updated_at: db.fn.now()
      });

    const updatedUser = await db('users')
      .where({ id: req.user.id })
      .select('id', 'phone', 'email', 'full_name', 'address', 'date_of_birth', 'role', 'status', 'prepaid_balance', 'payment_mode', 'profile_image', 'created_at')
      .first();

    res.json({
      success: true,
      message: 'Address updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update payment mode
 * PUT /api/user/payment-mode
 */
router.put('/payment-mode', [
  body('payment_mode')
    .isIn(['prepaid', 'cash_on_delivery'])
    .withMessage('Invalid payment mode')
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

    const { payment_mode } = req.body;

    await db('users')
      .where({ id: req.user.id })
      .update({
        payment_mode,
        updated_at: db.fn.now()
      });

    const updatedUser = await db('users')
      .where({ id: req.user.id })
      .select('id', 'phone', 'email', 'full_name', 'address', 'date_of_birth', 'role', 'status', 'prepaid_balance', 'payment_mode', 'profile_image', 'created_at')
      .first();

    res.json({
      success: true,
      message: 'Payment mode updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update payment mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get user orders
 * GET /api/user/orders
 */
router.get('/orders', async (req, res) => {
  try {
    const orders = await db('orders')
      .where({ user_id: req.user.id })
      .leftJoin('order_items', 'orders.id', 'order_items.order_id')
      .leftJoin('products', 'order_items.product_id', 'products.id')
      .select(
        'orders.*',
        db.raw('JSON_AGG(JSON_BUILD_OBJECT(\'product_id\', products.id, \'name\', products.name, \'quantity\', order_items.quantity, \'price\', order_items.price)) as items')
      )
      .groupBy('orders.id')
      .orderBy('orders.created_at', 'desc');

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get user subscriptions
 * GET /api/user/subscriptions
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await db('subscriptions')
      .where({ user_id: req.user.id })
      .leftJoin('products', 'subscriptions.product_id', 'products.id')
      .select(
        'subscriptions.*',
        'products.name as product_name',
        'products.price as product_price',
        'products.unit as product_unit'
      )
      .orderBy('subscriptions.created_at', 'desc');

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;