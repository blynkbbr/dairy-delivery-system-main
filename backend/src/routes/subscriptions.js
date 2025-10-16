const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate next delivery date
function calculateNextDelivery(startDate, frequency, deliveryDays, deliveryDate) {
  const start = new Date(startDate);
  const now = new Date();
  
  if (frequency === 'daily') {
    const next = new Date(Math.max(start, now));
    next.setDate(next.getDate() + 1);
    return next.toISOString().split('T')[0];
  } else if (frequency === 'weekly') {
    // Implementation for weekly delivery
    const next = new Date(Math.max(start, now));
    next.setDate(next.getDate() + 7);
    return next.toISOString().split('T')[0];
  } else if (frequency === 'monthly') {
    // Implementation for monthly delivery
    const next = new Date(Math.max(start, now));
    next.setMonth(next.getMonth() + 1);
    return next.toISOString().split('T')[0];
  }
  
  return startDate;
}

// Get user subscriptions
router.get('/', [
  authenticate,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('status').optional().isIn(['active', 'paused', 'cancelled'])
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, status } = req.query;

    // Build query with Knex
    let query = db('subscriptions')
      .select(
        'subscriptions.*',
        'products.name as product_name',
        'products.price as product_price',
        'products.unit as product_unit',
        'products.image_url as product_image'
      )
      .leftJoin('products', 'subscriptions.product_id', 'products.id')
      .where('subscriptions.user_id', userId)
      .orderBy('subscriptions.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (status) {
      query = query.where('subscriptions.status', status);
    }

    const subscriptions = await query;

    // Get total count
    let countQuery = db('subscriptions')
      .count('id as total')
      .where('user_id', userId);
    
    if (status) {
      countQuery = countQuery.where('status', status);
    }

    const countResult = await countQuery.first();
    const total = parseInt(countResult.total);

    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      product_id: sub.product_id,
      product: sub.product_name ? {
        id: sub.product_id,
        name: sub.product_name,
        price: sub.product_price,
        unit: sub.product_unit,
        image_url: sub.product_image
      } : null,
      quantity: sub.quantity,
      frequency: sub.frequency,
      delivery_days: sub.delivery_days ? JSON.parse(sub.delivery_days) : null,
      delivery_date: sub.delivery_date,
      delivery_time_slot: sub.delivery_time_slot,
      start_date: sub.start_date,
      end_date: sub.end_date,
      next_delivery: sub.next_delivery,
      status: sub.status,
      notes: sub.notes,
      created_at: sub.created_at,
      updated_at: sub.updated_at
    }));

    res.json({ 
      success: true,
      data: formattedSubscriptions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + formattedSubscriptions.length < total
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch subscriptions' 
    });
  }
});

// Get single subscription
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptionId = req.params.id;

    const subscription = await db('subscriptions')
      .select(
        'subscriptions.*',
        'products.name as product_name',
        'products.price as product_price',
        'products.unit as product_unit',
        'products.image_url as product_image'
      )
      .leftJoin('products', 'subscriptions.product_id', 'products.id')
      .where({ 'subscriptions.id': subscriptionId, 'subscriptions.user_id': userId })
      .first();

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    const formattedSubscription = {
      id: subscription.id,
      user_id: subscription.user_id,
      product_id: subscription.product_id,
      product: subscription.product_name ? {
        id: subscription.product_id,
        name: subscription.product_name,
        price: subscription.product_price,
        unit: subscription.product_unit,
        image_url: subscription.product_image
      } : null,
      quantity: subscription.quantity,
      frequency: subscription.frequency,
      delivery_days: subscription.delivery_days ? JSON.parse(subscription.delivery_days) : null,
      delivery_date: subscription.delivery_date,
      delivery_time_slot: subscription.delivery_time_slot,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      next_delivery: subscription.next_delivery,
      status: subscription.status,
      notes: subscription.notes,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at
    };

    res.json({ 
      success: true,
      data: formattedSubscription 
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch subscription' 
    });
  }
});

// Create subscription
router.post('/', [
  authenticate,
  body('product_id').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('frequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Valid frequency is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('delivery_days').optional().isArray(),
  body('delivery_date').optional().isInt({ min: 1, max: 31 }),
  body('delivery_time_slot').optional().isString(),
  body('notes').optional().isString()
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

    const userId = req.user.id;
    const { 
      product_id, 
      quantity, 
      frequency, 
      delivery_days, 
      delivery_date, 
      start_date, 
      delivery_time_slot, 
      notes 
    } = req.body;

    // Validate frequency-specific requirements
    if (frequency === 'weekly' && (!delivery_days || delivery_days.length === 0)) {
      return res.status(400).json({ 
        success: false,
        message: 'Weekly subscriptions require delivery_days' 
      });
    }

    if (frequency === 'monthly' && !delivery_date) {
      return res.status(400).json({ 
        success: false,
        message: 'Monthly subscriptions require delivery_date' 
      });
    }

    // Verify product exists and is active
    const product = await db('products')
      .where({ id: product_id, status: 'active' })
      .first();

    if (!product) {
      return res.status(400).json({ 
        success: false,
        message: 'Product not found or not available for subscription' 
      });
    }

    // Calculate next delivery date
    const nextDelivery = calculateNextDelivery(start_date, frequency, delivery_days, delivery_date);

    // Create subscription
    const [subscription] = await db('subscriptions')
      .insert({
        user_id: userId,
        product_id,
        quantity,
        frequency,
        delivery_days: delivery_days ? JSON.stringify(delivery_days) : null,
        delivery_date,
        start_date,
        next_delivery: nextDelivery,
        delivery_time_slot,
        notes,
        status: 'active'
      })
      .returning('*');

    // Fetch the created subscription with product details
    const createdSubscription = await db('subscriptions')
      .select(
        'subscriptions.*',
        'products.name as product_name',
        'products.price as product_price',
        'products.unit as product_unit',
        'products.image_url as product_image'
      )
      .leftJoin('products', 'subscriptions.product_id', 'products.id')
      .where('subscriptions.id', subscription.id)
      .first();

    const formattedSubscription = {
      id: createdSubscription.id,
      user_id: createdSubscription.user_id,
      product_id: createdSubscription.product_id,
      product: {
        id: createdSubscription.product_id,
        name: createdSubscription.product_name,
        price: createdSubscription.product_price,
        unit: createdSubscription.product_unit,
        image_url: createdSubscription.product_image
      },
      quantity: createdSubscription.quantity,
      frequency: createdSubscription.frequency,
      delivery_days: createdSubscription.delivery_days ? JSON.parse(createdSubscription.delivery_days) : null,
      delivery_date: createdSubscription.delivery_date,
      delivery_time_slot: createdSubscription.delivery_time_slot,
      start_date: createdSubscription.start_date,
      end_date: createdSubscription.end_date,
      next_delivery: createdSubscription.next_delivery,
      status: createdSubscription.status,
      notes: createdSubscription.notes,
      created_at: createdSubscription.created_at,
      updated_at: createdSubscription.updated_at
    };

    res.status(201).json({ 
      success: true,
      message: 'Subscription created successfully',
      data: formattedSubscription 
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create subscription' 
    });
  }
});

// Update subscription
router.put('/:id', [
  authenticate,
  body('quantity').optional().isInt({ min: 1 }),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly']),
  body('delivery_days').optional().isArray(),
  body('delivery_date').optional().isInt({ min: 1, max: 31 }),
  body('delivery_time_slot').optional().isString(),
  body('status').optional().isIn(['active', 'paused', 'cancelled']),
  body('notes').optional().isString(),
  body('end_date').optional().isISO8601()
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

    const userId = req.user.id;
    const subscriptionId = req.params.id;
    const updateData = req.body;

    // Check if subscription exists and belongs to user
    const existingSubscription = await db('subscriptions')
      .where({ id: subscriptionId, user_id: userId })
      .first();

    if (!existingSubscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    // Update subscription
    await db('subscriptions')
      .where({ id: subscriptionId })
      .update({
        ...updateData,
        updated_at: new Date()
      });

    // Fetch updated subscription with product details
    const updatedSubscription = await db('subscriptions')
      .select(
        'subscriptions.*',
        'products.name as product_name',
        'products.price as product_price',
        'products.unit as product_unit',
        'products.image_url as product_image'
      )
      .leftJoin('products', 'subscriptions.product_id', 'products.id')
      .where('subscriptions.id', subscriptionId)
      .first();

    const formattedSubscription = {
      id: updatedSubscription.id,
      user_id: updatedSubscription.user_id,
      product_id: updatedSubscription.product_id,
      product: updatedSubscription.product_name ? {
        id: updatedSubscription.product_id,
        name: updatedSubscription.product_name,
        price: updatedSubscription.product_price,
        unit: updatedSubscription.product_unit,
        image_url: updatedSubscription.product_image
      } : null,
      quantity: updatedSubscription.quantity,
      frequency: updatedSubscription.frequency,
      delivery_days: updatedSubscription.delivery_days ? JSON.parse(updatedSubscription.delivery_days) : null,
      delivery_date: updatedSubscription.delivery_date,
      delivery_time_slot: updatedSubscription.delivery_time_slot,
      start_date: updatedSubscription.start_date,
      end_date: updatedSubscription.end_date,
      next_delivery: updatedSubscription.next_delivery,
      status: updatedSubscription.status,
      notes: updatedSubscription.notes,
      created_at: updatedSubscription.created_at,
      updated_at: updatedSubscription.updated_at
    };

    res.json({ 
      success: true,
      message: 'Subscription updated successfully',
      data: formattedSubscription 
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update subscription' 
    });
  }
});

// Pause subscription
router.post('/:id/pause', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptionId = req.params.id;

    const subscription = await db('subscriptions')
      .where({ id: subscriptionId, user_id: userId })
      .first();

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    await db('subscriptions')
      .where({ id: subscriptionId })
      .update({ status: 'paused', updated_at: new Date() });

    res.json({ 
      success: true,
      message: 'Subscription paused successfully' 
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to pause subscription' 
    });
  }
});

// Resume subscription
router.post('/:id/resume', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptionId = req.params.id;

    const subscription = await db('subscriptions')
      .where({ id: subscriptionId, user_id: userId })
      .first();

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    await db('subscriptions')
      .where({ id: subscriptionId })
      .update({ status: 'active', updated_at: new Date() });

    res.json({ 
      success: true,
      message: 'Subscription resumed successfully' 
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to resume subscription' 
    });
  }
});

// Cancel subscription
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptionId = req.params.id;

    const subscription = await db('subscriptions')
      .where({ id: subscriptionId, user_id: userId })
      .first();

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    await db('subscriptions')
      .where({ id: subscriptionId })
      .update({ status: 'cancelled', updated_at: new Date() });

    res.json({ 
      success: true,
      message: 'Subscription cancelled successfully' 
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel subscription' 
    });
  }
});

module.exports = router;