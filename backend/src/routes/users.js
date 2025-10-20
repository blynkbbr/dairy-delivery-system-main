const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../utils/database');
const { authenticate } = require('../middleware/auth');
const { logUserAction } = require('../utils/actionLogger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get user profile
 * GET /api/users/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'phone', 'email', 'full_name', 'role', 'status', 'prepaid_balance', 'payment_mode', 'profile_image', 'created_at')
      .where({ id: req.user.id })
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
 * PUT /api/users/profile
 */
router.put('/profile', [
  body('full_name').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail(),
  body('payment_mode').optional().isIn(['prepaid', 'postpaid'])
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

    const { full_name, email, payment_mode } = req.body;
    const updateData = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (payment_mode !== undefined) updateData.payment_mode = payment_mode;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    await db('users')
      .where({ id: req.user.id })
      .update(updateData);

    const updatedUser = await db('users')
      .select('id', 'phone', 'email', 'full_name', 'role', 'status', 'prepaid_balance', 'payment_mode', 'profile_image')
      .where({ id: req.user.id })
      .first();

    // Log user action
    logUserAction('profile_update', {
      updatedFields: Object.keys(updateData),
      userId: req.user.id,
    }, req);

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
 * Get user addresses
 * GET /api/users/addresses
 */
router.get('/addresses', async (req, res) => {
  try {
    const addresses = await db('addresses')
      .where({ user_id: req.user.id })
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Add new address
 * POST /api/users/addresses
 */
router.post('/addresses', [
  body('line1').trim().isLength({ min: 1 }).withMessage('Address line 1 is required'),
  body('line2').optional().trim(),
  body('area').trim().isLength({ min: 1 }).withMessage('Area is required'),
  body('city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 1 }).withMessage('State is required'),
  body('pincode').trim().isLength({ min: 6, max: 6 }).withMessage('Valid pincode is required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('label').optional().trim(),
  body('is_default').optional().isBoolean()
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

    const { line1, line2, area, city, state, pincode, latitude, longitude, label, is_default } = req.body;

    // If this is set as default, unset other default addresses
    if (is_default) {
      await db('addresses')
        .where({ user_id: req.user.id })
        .update({ is_default: false });
    }

    // If this is the first address, make it default
    const existingAddresses = await db('addresses')
      .where({ user_id: req.user.id })
      .count('id as count')
      .first();

    const shouldBeDefault = is_default || existingAddresses.count === 0;

    const [newAddress] = await db('addresses')
      .insert({
        user_id: req.user.id,
        line1,
        line2,
        area,
        city,
        state,
        pincode,
        latitude,
        longitude,
        label,
        is_default: shouldBeDefault
      })
      .returning('*');

    // Log user action
    logUserAction('address_add', {
      addressId: newAddress.id,
      isDefault: shouldBeDefault,
      userId: req.user.id,
    }, req);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update address
 * PUT /api/users/addresses/:id
 */
router.put('/addresses/:id', [
  body('line1').optional().trim().isLength({ min: 1 }),
  body('line2').optional().trim(),
  body('area').optional().trim().isLength({ min: 1 }),
  body('city').optional().trim().isLength({ min: 1 }),
  body('state').optional().trim().isLength({ min: 1 }),
  body('pincode').optional().trim().isLength({ min: 6, max: 6 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('label').optional().trim(),
  body('is_default').optional().isBoolean()
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

    const { id } = req.params;
    const updateData = req.body;

    // Check if address belongs to user
    const address = await db('addresses')
      .where({ id, user_id: req.user.id })
      .first();

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, unset other defaults
    if (updateData.is_default) {
      await db('addresses')
        .where({ user_id: req.user.id })
        .whereNot({ id })
        .update({ is_default: false });
    }

    await db('addresses')
      .where({ id })
      .update(updateData);

    const updatedAddress = await db('addresses')
      .where({ id })
      .first();

    // Log user action
    logUserAction('address_update', {
      addressId: id,
      updatedFields: Object.keys(updateData),
      userId: req.user.id,
    }, req);

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress
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
 * Delete address
 * DELETE /api/users/addresses/:id
 */
router.delete('/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const address = await db('addresses')
      .where({ id, user_id: req.user.id })
      .first();

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await db('addresses').where({ id }).del();

    // If deleted address was default, make another address default
    if (address.is_default) {
      const nextAddress = await db('addresses')
        .where({ user_id: req.user.id })
        .orderBy('created_at', 'asc')
        .first();

      if (nextAddress) {
        await db('addresses')
          .where({ id: nextAddress.id })
          .update({ is_default: true });
      }
    }

    // Log user action
    logUserAction('address_delete', {
      addressId: id,
      wasDefault: address.is_default,
      userId: req.user.id,
    }, req);

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;