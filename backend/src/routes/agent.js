const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(authorize('agent'));

/**
 * Get agent's deliveries for today
 * GET /api/agent/deliveries/today
 */
router.get('/deliveries/today', async (req, res) => {
  try {
    const agentId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's deliveries assigned to this agent
    const deliveries = await db('subscription_deliveries')
      .select(
        'subscription_deliveries.*',
        'users.full_name as customer_name',
        'users.phone as customer_phone',
        'products.name as product_name',
        'products.unit as product_unit',
        'addresses.line1',
        'addresses.line2',
        'addresses.area',
        'addresses.city',
        'addresses.landmark'
      )
      .leftJoin('users', 'subscription_deliveries.user_id', 'users.id')
      .leftJoin('products', 'subscription_deliveries.product_id', 'products.id')
      .leftJoin('addresses', 'subscription_deliveries.address_id', 'addresses.id')
      .where('subscription_deliveries.agent_id', agentId)
      .where('subscription_deliveries.delivery_date', today)
      .orderBy('subscription_deliveries.scheduled_time', 'asc');

    // Format the response
    const formattedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      customer_name: delivery.customer_name,
      customer_phone: delivery.customer_phone,
      address: `${delivery.line1}${delivery.line2 ? ', ' + delivery.line2 : ''}, ${delivery.area}, ${delivery.city}`,
      product_name: delivery.product_name,
      quantity: delivery.quantity,
      status: delivery.status,
      delivery_date: delivery.delivery_date,
      time_slot: delivery.scheduled_time,
      notes: delivery.notes
    }));

    res.json({
      success: true,
      data: formattedDeliveries
    });
  } catch (error) {
    console.error('Get agent deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries'
    });
  }
});

/**
 * Get agent's route for today
 * GET /api/agent/route/today
 */
router.get('/route/today', async (req, res) => {
  try {
    const agentId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get route information
    const route = await db('delivery_routes')
      .select('*')
      .where('agent_id', agentId)
      .where('route_date', today)
      .first();

    if (!route) {
      return res.json({
        success: true,
        data: null
      });
    }

    // Get delivery counts
    const deliveryCounts = await db('subscription_deliveries')
      .select(
        db.raw('COUNT(*) as total_deliveries'),
        db.raw('COUNT(CASE WHEN status = \'delivered\' THEN 1 END) as completed_deliveries')
      )
      .where('agent_id', agentId)
      .where('delivery_date', today)
      .first();

    const routeData = {
      id: route.id,
      name: route.route_name,
      total_deliveries: parseInt(deliveryCounts.total_deliveries) || 0,
      completed_deliveries: parseInt(deliveryCounts.completed_deliveries) || 0,
      distance: route.total_distance || 0,
      estimated_time: route.estimated_duration || 0
    };

    res.json({
      success: true,
      data: routeData
    });
  } catch (error) {
    console.error('Get agent route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route'
    });
  }
});

/**
 * Update delivery status
 * PUT /api/agent/deliveries/:id
 */
router.put('/deliveries/:id', [
  body('status').isIn(['pending', 'picked_up', 'in_transit', 'delivered', 'failed']).withMessage('Valid status required')
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

    const deliveryId = req.params.id;
    const { status } = req.body;
    const agentId = req.user.id;

    // Verify delivery belongs to this agent
    const delivery = await db('subscription_deliveries')
      .where({ id: deliveryId, agent_id: agentId })
      .first();

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found or not assigned to you'
      });
    }

    // Update delivery status
    const updateData = {
      status,
      updated_at: new Date()
    };

    // Add timestamps for status changes
    if (status === 'picked_up') {
      updateData.picked_up_at = new Date();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date();
    } else if (status === 'failed') {
      updateData.failed_at = new Date();
    }

    await db('subscription_deliveries')
      .where('id', deliveryId)
      .update(updateData);

    res.json({
      success: true,
      message: 'Delivery status updated successfully'
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status'
    });
  }
});

/**
 * Get agent statistics
 * GET /api/agent/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const agentId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substr(0, 7);

    // Get today's stats
    const todayStats = await db('subscription_deliveries')
      .select(
        db.raw('COUNT(*) as total_deliveries'),
        db.raw('COUNT(CASE WHEN status = \'delivered\' THEN 1 END) as completed_deliveries'),
        db.raw('COUNT(CASE WHEN status IN (\'pending\', \'picked_up\', \'in_transit\') THEN 1 END) as pending_deliveries')
      )
      .where('agent_id', agentId)
      .where('delivery_date', today)
      .first();

    // Get monthly stats
    const monthlyStats = await db('subscription_deliveries')
      .select(
        db.raw('COUNT(*) as total_monthly'),
        db.raw('COUNT(CASE WHEN status = \'delivered\' THEN 1 END) as completed_monthly')
      )
      .where('agent_id', agentId)
      .where(db.raw('DATE_FORMAT(delivery_date, \'%Y-%m\')'), thisMonth)
      .first();

    const efficiency = todayStats.total_deliveries > 0 
      ? (todayStats.completed_deliveries / todayStats.total_deliveries) * 100 
      : 0;

    const stats = {
      today: {
        total_deliveries: parseInt(todayStats.total_deliveries) || 0,
        completed_deliveries: parseInt(todayStats.completed_deliveries) || 0,
        pending_deliveries: parseInt(todayStats.pending_deliveries) || 0,
        efficiency: Math.round(efficiency * 10) / 10
      },
      monthly: {
        total_deliveries: parseInt(monthlyStats.total_monthly) || 0,
        completed_deliveries: parseInt(monthlyStats.completed_monthly) || 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

/**
 * Mark delivery with proof (photo, signature, etc.)
 * POST /api/agent/deliveries/:id/proof
 */
router.post('/deliveries/:id/proof', [
  body('proof_type').isIn(['photo', 'signature', 'otp']).withMessage('Valid proof type required'),
  body('proof_data').isString().withMessage('Proof data required')
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

    const deliveryId = req.params.id;
    const { proof_type, proof_data, notes } = req.body;
    const agentId = req.user.id;

    // Verify delivery belongs to this agent
    const delivery = await db('subscription_deliveries')
      .where({ id: deliveryId, agent_id: agentId })
      .first();

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found or not assigned to you'
      });
    }

    // Update delivery with proof
    await db('subscription_deliveries')
      .where('id', deliveryId)
      .update({
        proof_type,
        proof_data,
        delivery_notes: notes,
        status: 'delivered',
        delivered_at: new Date(),
        updated_at: new Date()
      });

    res.json({
      success: true,
      message: 'Delivery proof submitted successfully'
    });
  } catch (error) {
    console.error('Submit delivery proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit delivery proof'
    });
  }
});

module.exports = router;