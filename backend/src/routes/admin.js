const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { manualTriggers } = require('../services/cronJobs');
const db = require('../utils/database');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

/**
 * System Status and Health Check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'dairy-delivery-system',
    version: '1.0.0'
  });
});

/**
 * Manual Job Triggers
 */

// Generate routes for today
router.post('/jobs/routes/today', async (req, res) => {
  try {
    const routes = await manualTriggers.generateTodayRoutes();
    res.json({
      success: true,
      message: 'Routes generated successfully for today',
      data: {
        routeCount: routes.length,
        routes: routes.map(route => ({
          id: route.id,
          agentId: route.agent_id,
          stopCount: route.stops?.length || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error generating today routes:', error);
    res.status(500).json({
      error: 'Failed to generate routes for today',
      details: error.message
    });
  }
});

// Generate routes for tomorrow  
router.post('/jobs/routes/tomorrow', async (req, res) => {
  try {
    const routes = await manualTriggers.generateTomorrowRoutes();
    res.json({
      success: true,
      message: 'Routes generated successfully for tomorrow',
      data: {
        routeCount: routes.length,
        routes: routes.map(route => ({
          id: route.id,
          agentId: route.agent_id,
          stopCount: route.stops?.length || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error generating tomorrow routes:', error);
    res.status(500).json({
      error: 'Failed to generate routes for tomorrow',
      details: error.message
    });
  }
});

// Generate weekly invoices
router.post('/jobs/invoices/weekly', async (req, res) => {
  try {
    const result = await manualTriggers.generateWeeklyInvoicesNow();
    res.json({
      success: true,
      message: 'Weekly invoices generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error generating weekly invoices:', error);
    res.status(500).json({
      error: 'Failed to generate weekly invoices',
      details: error.message
    });
  }
});

// Generate monthly invoices
router.post('/jobs/invoices/monthly', async (req, res) => {
  try {
    const result = await manualTriggers.generateMonthlyInvoicesNow();
    res.json({
      success: true,
      message: 'Monthly invoices generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error generating monthly invoices:', error);
    res.status(500).json({
      error: 'Failed to generate monthly invoices',
      details: error.message
    });
  }
});

// Update subscription deliveries
router.post('/jobs/subscriptions/update', async (req, res) => {
  try {
    await manualTriggers.updateSubscriptionDeliveries();
    res.json({
      success: true,
      message: 'Subscription deliveries updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription deliveries:', error);
    res.status(500).json({
      error: 'Failed to update subscription deliveries',
      details: error.message
    });
  }
});

// Mark overdue invoices
router.post('/jobs/invoices/mark-overdue', async (req, res) => {
  try {
    await manualTriggers.markOverdueInvoicesNow();
    res.json({
      success: true,
      message: 'Overdue invoices marked successfully'
    });
  } catch (error) {
    console.error('Error marking overdue invoices:', error);
    res.status(500).json({
      error: 'Failed to mark overdue invoices',
      details: error.message
    });
  }
});

// Data cleanup
router.post('/jobs/cleanup', async (req, res) => {
  try {
    await manualTriggers.cleanupDataNow();
    res.json({
      success: true,
      message: 'Data cleanup completed successfully'
    });
  } catch (error) {
    console.error('Error during data cleanup:', error);
    res.status(500).json({
      error: 'Failed to cleanup data',
      details: error.message
    });
  }
});

/**
 * System Statistics and Dashboard
 */
router.get('/dashboard', async (req, res) => {
  const db = require('../utils/database');
  
  try {
    const [
      totalUsers,
      activeSubscriptions,
      todayDeliveries,
      pendingInvoices,
      totalRevenue,
      activeAgents
    ] = await Promise.all([
      db('users').count('id as count').first(),
      db('subscriptions').where('status', 'active').count('id as count').first(),
      db('subscription_deliveries')
        .where('delivery_date', new Date().toISOString().split('T')[0])
        .count('id as count').first(),
      db('invoices').whereIn('status', ['sent', 'overdue']).count('id as count').first(),
      db('invoices').where('status', 'paid').sum('total as sum').first(),
      db('users').where('role', 'agent').where('status', 'active').count('id as count').first()
    ]);

    // Get recent activities
    const recentOrders = await db('subscription_deliveries')
      .join('users', 'subscription_deliveries.user_id', 'users.id')
      .join('products', 'subscription_deliveries.product_id', 'products.id')
      .select(
        'subscription_deliveries.id',
        'users.name as customer_name',
        'products.name as product_name',
        'subscription_deliveries.quantity',
        'subscription_deliveries.status',
        'subscription_deliveries.delivery_date'
      )
      .orderBy('subscription_deliveries.created_at', 'desc')
      .limit(10);

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers: totalUsers.count,
          activeSubscriptions: activeSubscriptions.count,
          todayDeliveries: todayDeliveries.count,
          pendingInvoices: pendingInvoices.count,
          totalRevenue: totalRevenue.sum || 0,
          activeAgents: activeAgents.count
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      details: error.message
    });
  }
});

router.get('/analytics', async (req, res) => {
  const db = require('../utils/database');
  
  try {
    // Get monthly revenue for the last 12 months
    const monthlyRevenue = await db('invoices')
      .select(
        db.raw('YEAR(paid_at) as year'),
        db.raw('MONTH(paid_at) as month'),
        db.raw('SUM(total) as revenue')
      )
      .where('status', 'paid')
      .where('paid_at', '>=', db.raw('DATE_SUB(NOW(), INTERVAL 12 MONTH)'))
      .groupBy('year', 'month')
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');

    // Get top products
    const topProducts = await db('subscription_deliveries')
      .join('products', 'subscription_deliveries.product_id', 'products.id')
      .select(
        'products.name',
        db.raw('SUM(subscription_deliveries.quantity) as total_quantity'),
        db.raw('COUNT(subscription_deliveries.id) as delivery_count')
      )
      .where('subscription_deliveries.status', 'delivered')
      .groupBy('products.id', 'products.name')
      .orderBy('total_quantity', 'desc')
      .limit(10);

    // Get delivery performance
    const deliveryStats = await db('subscription_deliveries')
      .select(
        'status',
        db.raw('COUNT(*) as count')
      )
      .where('delivery_date', '>=', db.raw('DATE_SUB(NOW(), INTERVAL 30 DAY)'))
      .groupBy('status');

    res.json({
      success: true,
      analytics: {
        monthlyRevenue,
        topProducts,
        deliveryStats
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      details: error.message
    });
  }
});

/**
 * User Management
 */
router.get('/users', async (req, res) => {
  const db = require('../utils/database');
  const { page = 1, limit = 20, search = '', status = '' } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = db('users').select(
      'id', 'phone_number', 'name', 'email', 'role', 'status', 
      'created_at', 'last_login_at'
    );

    if (search) {
      query = query.where(function() {
        this.where('name', 'like', `%${search}%`)
            .orWhere('phone_number', 'like', `%${search}%`)
            .orWhere('email', 'like', `%${search}%`);
      });
    }

    if (status) {
      query = query.where('status', status);
    }

    const users = await query.limit(limit).offset(offset).orderBy('created_at', 'desc');
    const total = await db('users').count('id as count').first();

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});

/**
 * Product Management
 */
router.get('/products', async (req, res) => {
  const db = require('../utils/database');

  try {
    const products = await db('products')
      .select('*')
      .orderBy('created_at', 'desc');

    res.json({ 
      success: true,
      products 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});

router.post('/products', async (req, res) => {
  const db = require('../utils/database');
  const { name, description, price, unit, category, image_url, status = 'active' } = req.body;

  // Validation
  if (!name || !price || !unit) {
    return res.status(400).json({
      error: 'Name, price, and unit are required'
    });
  }

  try {
    const [productId] = await db('products').insert({
      name,
      description,
      price: parseFloat(price),
      unit,
      category,
      image_url,
      status,
      created_at: new Date(),
      updated_at: new Date()
    });

    const product = await db('products').where('id', productId).first();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Failed to create product',
      details: error.message
    });
  }
});

router.put('/products/:id', async (req, res) => {
  const db = require('../utils/database');
  const { id } = req.params;
  const updates = req.body;

  try {
    await db('products')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date()
      });

    const product = await db('products').where('id', id).first();
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Failed to update product',
      details: error.message
    });
  }
});

/**
 * Subscription Management
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', frequency = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = db('subscriptions')
      .select(
        'subscriptions.*',
        'users.full_name as user_name',
        'users.email as user_email',
        'users.phone as user_phone',
        'products.name as product_name',
        'products.price as product_price',
        'products.unit as product_unit'
      )
      .leftJoin('users', 'subscriptions.user_id', 'users.id')
      .leftJoin('products', 'subscriptions.product_id', 'products.id');

    if (search) {
      query = query.where(function() {
        this.where('users.full_name', 'like', `%${search}%`)
            .orWhere('users.email', 'like', `%${search}%`)
            .orWhere('products.name', 'like', `%${search}%`);
      });
    }

    if (status) {
      query = query.where('subscriptions.status', status);
    }

    if (frequency) {
      query = query.where('subscriptions.frequency', frequency);
    }

    const subscriptions = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy('subscriptions.created_at', 'desc');

    const total = await db('subscriptions').count('id as count').first();

    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      user: {
        id: sub.user_id,
        full_name: sub.user_name,
        email: sub.user_email,
        phone: sub.user_phone
      },
      product: {
        id: sub.product_id,
        name: sub.product_name,
        price: sub.product_price,
        unit: sub.product_unit
      },
      quantity: sub.quantity,
      frequency: sub.frequency,
      delivery_days: sub.delivery_days ? JSON.parse(sub.delivery_days) : null,
      delivery_date: sub.delivery_date,
      status: sub.status,
      start_date: sub.start_date,
      next_delivery: sub.next_delivery,
      created_at: sub.created_at
    }));

    res.json({
      success: true,
      data: formattedSubscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

router.put('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'paused', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, paused, cancelled)'
      });
    }

    const subscription = await db('subscriptions').where('id', id).first();
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    await db('subscriptions')
      .where('id', id)
      .update({
        status,
        updated_at: new Date()
      });

    res.json({
      success: true,
      message: `Subscription ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
});

/**
 * System Configuration
 */
router.get('/config', (req, res) => {
  res.json({
    timezone: process.env.TZ || 'Asia/Kolkata',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: {
      cronJobs: true,
      routeOptimization: true,
      billing: true,
      notifications: false // placeholder for future SMS/email notifications
    }
  });
});

module.exports = router;
