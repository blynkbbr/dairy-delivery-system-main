const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  generateDailyRoutes, 
  updateDeliveryStatus, 
  getAgentRoute 
} = require('../services/routeOptimization');

const router = express.Router();

router.use(authenticate);

/**
 * Generate routes for a specific date (admin only)
 * POST /api/routes/generate
 */
router.post('/generate', [
  authorize('admin'),
  body('date').isDate().withMessage('Valid date is required')
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

    const { date } = req.body;
    const routes = await generateDailyRoutes(date);

    res.json({
      success: true,
      message: `Generated ${routes.length} routes for ${date}`,
      routes
    });
  } catch (error) {
    console.error('Generate routes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

/**
 * Get agent's route for today or specific date
 * GET /api/routes/my-route
 */
router.get('/my-route', [
  authorize('agent'),
  query('date').optional().isDate()
], async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const route = await getAgentRoute(req.user.id, date);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'No route found for the specified date'
      });
    }

    res.json({
      success: true,
      route
    });
  } catch (error) {
    console.error('Get agent route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update delivery status
 * PUT /api/routes/stops/:id/status
 */
router.put('/stops/:id/status', [
  authorize('agent'),
  body('status').isIn(['pending', 'in_transit', 'delivered', 'missed']).withMessage('Valid status required'),
  body('delivery_notes').optional().trim(),
  body('proof_image').optional().trim()
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
    const { status, delivery_notes, proof_image } = req.body;

    await updateDeliveryStatus(id, status, delivery_notes, proof_image);

    res.json({
      success: true,
      message: 'Delivery status updated successfully'
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get all routes for admin
 * GET /api/routes/admin/all
 */
router.get('/admin/all', [
  authorize('admin'),
  query('date').optional().isDate(),
  query('status').optional().isIn(['planned', 'in_progress', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const db = require('../utils/database');
    const { date, status } = req.query;
    
    let query = db('routes')
      .select(
        'routes.*',
        'users.full_name as agent_name',
        'users.phone as agent_phone'
      )
      .leftJoin('users', 'routes.agent_id', 'users.id')
      .orderBy('routes.created_at', 'desc');

    if (date) {
      query = query.where('routes.route_date', date);
    }

    if (status) {
      query = query.where('routes.status', status);
    }

    const routes = await query;

    // Get stop counts for each route
    for (const route of routes) {
      const stopCounts = await db('route_stops')
        .where('route_id', route.id)
        .count('* as total')
        .count(db.raw('CASE WHEN status = ? THEN 1 END as delivered'), ['delivered'])
        .first();
      
      route.total_stops = parseInt(stopCounts.total);
      route.delivered_stops = parseInt(stopCounts.delivered || 0);
    }

    res.json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Get all routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
