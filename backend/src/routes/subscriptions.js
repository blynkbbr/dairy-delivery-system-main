const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

router.use(authenticate);

/**
 * Get user's subscriptions
 * GET /api/subscriptions
 */
router.get('/', async (req, res) => {
  try {
    const db = require('../utils/database');
    
    const subscriptions = await db('subscriptions')
      .select(
        'subscriptions.*',
        'products.name as product_name',
        'products.unit as product_unit',
        'products.price as current_price',
        'addresses.line1 as address_line1',
        'addresses.area as address_area',
        'addresses.city as address_city'
      )
      .leftJoin('products', 'subscriptions.product_id', 'products.id')
      .leftJoin('addresses', 'subscriptions.address_id', 'addresses.id')
      .where('subscriptions.user_id', req.user.id)
      .orderBy('subscriptions.created_at', 'desc');

    // Parse delivery_days JSON
    const subscriptionsWithDays = subscriptions.map(sub => ({
      ...sub,
      delivery_days: JSON.parse(sub.delivery_days || '[]')
    }));

    res.json({
      success: true,
      subscriptions: subscriptionsWithDays
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Create new subscription
 * POST /api/subscriptions
 */
router.post('/', [
  body('address_id').isUUID().withMessage('Valid address ID is required'),
  body('product_id').isUUID().withMessage('Valid product ID is required'),
  body('default_quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('delivery_days').isArray({ min: 1 }).withMessage('At least one delivery day is required'),
  body('delivery_days.*').isInt({ min: 0, max: 6 }).withMessage('Invalid delivery day'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').optional().isDate(),
  body('billing_cycle').isIn(['weekly', 'monthly']).withMessage('Invalid billing cycle'),
  body('payment_mode').optional().isIn(['prepaid', 'postpaid']),
  body('notes').optional().trim()
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

    const db = require('../utils/database');
    const {
      address_id,
      product_id,
      default_quantity,
      delivery_days,
      start_date,
      end_date,
      billing_cycle,
      payment_mode,
      notes
    } = req.body;

    // Verify address belongs to user
    const address = await db('addresses')
      .where({ id: address_id, user_id: req.user.id })
      .first();

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Verify product exists and is milk
    const product = await db('products')
      .where({ id: product_id, status: 'active', is_milk: true })
      .first();

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product not found or not available for subscription'
      });
    }

    // Create subscription
    const [subscription] = await db('subscriptions')
      .insert({
        user_id: req.user.id,
        address_id,
        product_id,
        default_quantity,
        delivery_days: JSON.stringify(delivery_days),
        start_date,
        end_date,
        billing_cycle,
        payment_mode: payment_mode || req.user.payment_mode,
        status: 'active',
        notes
      })
      .returning('*');

    // Generate initial subscription deliveries
    await generateSubscriptionDeliveries(subscription.id);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription: {
        ...subscription,
        delivery_days: JSON.parse(subscription.delivery_days)
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update subscription
 * PUT /api/subscriptions/:id
 */
router.put('/:id', [
  body('default_quantity').optional().isInt({ min: 1 }),
  body('delivery_days').optional().isArray({ min: 1 }),
  body('delivery_days.*').optional().isInt({ min: 0, max: 6 }),
  body('billing_cycle').optional().isIn(['weekly', 'monthly']),
  body('payment_mode').optional().isIn(['prepaid', 'postpaid']),
  body('status').optional().isIn(['active', 'paused', 'cancelled']),
  body('notes').optional().trim()
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

    const db = require('../utils/database');
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verify subscription belongs to user
    const subscription = await db('subscriptions')
      .where({ id, user_id: req.user.id })
      .first();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Handle delivery_days JSON
    if (updateData.delivery_days) {
      updateData.delivery_days = JSON.stringify(updateData.delivery_days);
    }

    await db('subscriptions')
      .where('id', id)
      .update(updateData);

    // If delivery days or quantity changed, regenerate future deliveries
    if (updateData.delivery_days || updateData.default_quantity) {
      await regenerateSubscriptionDeliveries(id);
    }

    const updatedSubscription = await db('subscriptions')
      .where('id', id)
      .first();

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        ...updatedSubscription,
        delivery_days: JSON.parse(updatedSubscription.delivery_days)
      }
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get subscription details
 * GET /api/subscriptions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const db = require('../utils/database');
    const { id } = req.params;

    const subscription = await db('subscriptions')
      .select(
        'subscriptions.*',
        'products.name as product_name',
        'products.unit as product_unit',
        'products.price as current_price',
        'addresses.line1 as address_line1',
        'addresses.line2 as address_line2',
        'addresses.area as address_area',
        'addresses.city as address_city',
        'addresses.state as address_state'
      )
      .leftJoin('products', 'subscriptions.product_id', 'products.id')
      .leftJoin('addresses', 'subscriptions.address_id', 'addresses.id')
      .where('subscriptions.id', id)
      .where('subscriptions.user_id', req.user.id)
      .first();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Get upcoming deliveries
    const upcomingDeliveries = await db('subscription_deliveries')
      .where('subscription_id', id)
      .where('delivery_date', '>=', new Date())
      .orderBy('delivery_date', 'asc')
      .limit(10);

    res.json({
      success: true,
      subscription: {
        ...subscription,
        delivery_days: JSON.parse(subscription.delivery_days),
        upcoming_deliveries: upcomingDeliveries
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get subscription deliveries
 * GET /api/subscriptions/:id/deliveries
 */
router.get('/:id/deliveries', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('status').optional().isIn(['scheduled', 'out_for_delivery', 'delivered', 'missed', 'cancelled'])
], async (req, res) => {
  try {
    const db = require('../utils/database');
    const { id } = req.params;
    const { limit = 20, offset = 0, status } = req.query;

    // Verify subscription belongs to user
    const subscription = await db('subscriptions')
      .where({ id, user_id: req.user.id })
      .first();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    let query = db('subscription_deliveries')
      .where('subscription_id', id)
      .orderBy('delivery_date', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (status) {
      query = query.where('status', status);
    }

    const deliveries = await query;

    res.json({
      success: true,
      deliveries
    });
  } catch (error) {
    console.error('Get subscription deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Helper functions
 */
async function generateSubscriptionDeliveries(subscriptionId) {
  const db = require('../utils/database');
  
  try {
    const subscription = await db('subscriptions').where('id', subscriptionId).first();
    if (!subscription || subscription.status !== 'active') {
      return;
    }

    const deliveryDays = JSON.parse(subscription.delivery_days);
    const startDate = moment(subscription.start_date);
    const endDate = subscription.end_date ? moment(subscription.end_date) : moment().add(3, 'months');
    
    const product = await db('products').where('id', subscription.product_id).first();
    
    const deliveriesToCreate = [];
    const current = startDate.clone();
    
    while (current.isSameOrBefore(endDate)) {
      const dayOfWeek = current.day(); // 0 = Sunday, 6 = Saturday
      
      if (deliveryDays.includes(dayOfWeek)) {
        // Check if delivery already exists
        const existingDelivery = await db('subscription_deliveries')
          .where('subscription_id', subscriptionId)
          .where('delivery_date', current.format('YYYY-MM-DD'))
          .first();
        
        if (!existingDelivery) {
          deliveriesToCreate.push({
            subscription_id: subscriptionId,
            user_id: subscription.user_id,
            address_id: subscription.address_id,
            product_id: subscription.product_id,
            delivery_date: current.format('YYYY-MM-DD'),
            quantity: subscription.default_quantity,
            unit_price: product.price,
            total_price: parseFloat(product.price) * subscription.default_quantity,
            status: 'scheduled'
          });
        }
      }
      
      current.add(1, 'day');
    }
    
    if (deliveriesToCreate.length > 0) {
      await db('subscription_deliveries').insert(deliveriesToCreate);
    }
  } catch (error) {
    console.error('Generate subscription deliveries error:', error);
  }
}

async function regenerateSubscriptionDeliveries(subscriptionId) {
  const db = require('../utils/database');
  
  try {
    // Delete future scheduled deliveries
    await db('subscription_deliveries')
      .where('subscription_id', subscriptionId)
      .where('delivery_date', '>', new Date())
      .where('status', 'scheduled')
      .del();
    
    // Generate new deliveries
    await generateSubscriptionDeliveries(subscriptionId);
  } catch (error) {
    console.error('Regenerate subscription deliveries error:', error);
  }
}

module.exports = router;
