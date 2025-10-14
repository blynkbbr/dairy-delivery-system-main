const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Create new order
 * POST /api/orders
 */
router.post('/', [
  body('address_id').isUUID().withMessage('Valid address ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Order items are required'),
  body('items.*.product_id').isUUID().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
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

    const { address_id, items, notes } = req.body;

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

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db('products')
        .where({ id: item.product_id, status: 'active' })
        .first();

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product_id} not found or inactive`
        });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`
        });
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal
      });
    }

    // Calculate delivery fee (basic logic - can be enhanced)
    const deliveryFee = subtotal >= 500 ? 0 : 50; // Free delivery above ₹500
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order in transaction
    const result = await db.transaction(async (trx) => {
      // Create order
      const [order] = await trx('orders')
        .insert({
          user_id: req.user.id,
          address_id,
          order_number: orderNumber,
          subtotal,
          delivery_fee: deliveryFee,
          tax,
          total,
          notes,
          status: 'pending'
        })
        .returning('*');

      // Create order items
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id
      }));

      await trx('order_items').insert(itemsWithOrderId);

      // Update stock quantities
      for (const item of orderItems) {
        await trx('products')
          .where({ id: item.product_id })
          .decrement('stock_quantity', item.quantity);
      }

      return order;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: result
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get user orders
 * GET /api/orders
 */
router.get('/', [
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = db('orders')
      .select('orders.*', 
        'addresses.line1 as address_line1',
        'addresses.area as address_area',
        'addresses.city as address_city'
      )
      .leftJoin('addresses', 'orders.address_id', 'addresses.id')
      .where('orders.user_id', req.user.id);

    if (status) {
      query = query.where('orders.status', status);
    }

    const orders = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy('orders.created_at', 'desc');

    // Get total count
    let countQuery = db('orders')
      .count('id as total')
      .where({ user_id: req.user.id });

    if (status) {
      countQuery = countQuery.where({ status });
    }

    const totalResult = await countQuery.first();
    const total = parseInt(totalResult.total);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + orders.length < total
      }
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
 * Get single order with items
 * GET /api/orders/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await db('orders')
      .select('orders.*',
        'addresses.line1 as address_line1',
        'addresses.line2 as address_line2',
        'addresses.area as address_area',
        'addresses.city as address_city',
        'addresses.state as address_state',
        'addresses.pincode as address_pincode'
      )
      .leftJoin('addresses', 'orders.address_id', 'addresses.id')
      .where('orders.id', id)
      .where('orders.user_id', req.user.id)
      .first();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const items = await db('order_items')
      .select('order_items.*', 'products.name as product_name', 'products.unit as product_unit')
      .leftJoin('products', 'order_items.product_id', 'products.id')
      .where('order_items.order_id', id);

    order.items = items;

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await db('orders')
      .where({ id, user_id: req.user.id })
      .first();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status to cancelled and restore stock
    await db.transaction(async (trx) => {
      await trx('orders')
        .where({ id })
        .update({ status: 'cancelled' });

      // Restore stock quantities
      const items = await trx('order_items')
        .where({ order_id: id });

      for (const item of items) {
        await trx('products')
          .where({ id: item.product_id })
          .increment('stock_quantity', item.quantity);
      }
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin routes
/**
 * Get all orders (admin only)
 * GET /api/orders/admin/all
 */
router.get('/admin/all', [
  authorize('admin'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = db('orders')
      .select('orders.*', 
        'users.full_name as customer_name',
        'users.phone as customer_phone',
        'addresses.line1 as address_line1',
        'addresses.area as address_area',
        'addresses.city as address_city'
      )
      .leftJoin('users', 'orders.user_id', 'users.id')
      .leftJoin('addresses', 'orders.address_id', 'addresses.id');

    if (status) {
      query = query.where('orders.status', status);
    }

    const orders = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy('orders.created_at', 'desc');

    // Get total count
    let countQuery = db('orders').count('id as total');
    if (status) {
      countQuery = countQuery.where({ status });
    }

    const totalResult = await countQuery.first();
    const total = parseInt(totalResult.total);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + orders.length < total
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update order status (admin only)
 * PUT /api/orders/:id/status
 */
router.put('/:id/status', [
  authorize('admin'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Valid status is required')
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
    const { status } = req.body;

    const order = await db('orders').where({ id }).first();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = { status };

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    await db('orders')
      .where({ id })
      .update(updateData);

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;