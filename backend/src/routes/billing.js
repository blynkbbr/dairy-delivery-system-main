const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  generateInvoice,
  topupPrepaidBalance,
  generateWeeklyInvoices,
  generateMonthlyInvoices,
  getUserBillingSummary
} = require('../services/billingService');

const router = express.Router();

router.use(authenticate);

/**
 * Get user's billing summary
 * GET /api/billing/summary
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await getUserBillingSummary(req.user.id);
    
    res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    console.error('Get billing summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Top up prepaid balance
 * POST /api/billing/topup
 */
router.post('/topup', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least ₹1'),
  body('payment_method').optional().isIn(['card', 'upi', 'netbanking']).withMessage('Invalid payment method')
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

    const { amount, payment_method = 'card' } = req.body;

    // In a real app, you would integrate with payment gateway here
    // For demo, we'll simulate successful payment
    const payment = await topupPrepaidBalance(req.user.id, amount, payment_method);

    res.json({
      success: true,
      message: 'Prepaid balance topped up successfully',
      payment,
      new_balance: (parseFloat(req.user.prepaid_balance) + amount).toFixed(2)
    });
  } catch (error) {
    console.error('Topup prepaid balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get user invoices
 * GET /api/billing/invoices
 */
router.get('/invoices', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
], async (req, res) => {
  try {
    const db = require('../utils/database');
    const { limit = 20, offset = 0, status } = req.query;

    let query = db('invoices')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (status) {
      query = query.where('status', status);
    }

    const invoices = await query;

    // Parse line items
    const invoicesWithItems = invoices.map(invoice => ({
      ...invoice,
      line_items: JSON.parse(invoice.line_items || '[]')
    }));

    res.json({
      success: true,
      invoices: invoicesWithItems
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get specific invoice
 * GET /api/billing/invoices/:id
 */
router.get('/invoices/:id', async (req, res) => {
  try {
    const db = require('../utils/database');
    const { id } = req.params;

    const invoice = await db('invoices')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      invoice: {
        ...invoice,
        line_items: JSON.parse(invoice.line_items || '[]')
      }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get payment history
 * GET /api/billing/payments
 */
router.get('/payments', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const db = require('../utils/database');
    const { limit = 20, offset = 0 } = req.query;

    const payments = await db('payments')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get ledger entries
 * GET /api/billing/ledger
 */
router.get('/ledger', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const db = require('../utils/database');
    const { limit = 50, offset = 0 } = req.query;

    const entries = await db('ledger_entries')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      entries
    });
  } catch (error) {
    console.error('Get ledger entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin routes
/**
 * Generate invoices manually (admin only)
 * POST /api/billing/admin/generate-invoices
 */
router.post('/admin/generate-invoices', [
  authorize('admin'),
  body('cycle').isIn(['weekly', 'monthly']).withMessage('Cycle must be weekly or monthly'),
  body('date').optional().isDate()
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

    const { cycle } = req.body;

    let result;
    if (cycle === 'weekly') {
      result = await generateWeeklyInvoices();
    } else {
      result = await generateMonthlyInvoices();
    }

    res.json(result);
  } catch (error) {
    console.error('Generate invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get all invoices (admin only)
 * GET /api/billing/admin/invoices
 */
router.get('/admin/invoices', [
  authorize('admin'),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  query('user_id').optional().isUUID()
], async (req, res) => {
  try {
    const db = require('../utils/database');
    const { limit = 50, offset = 0, status, user_id } = req.query;

    let query = db('invoices')
      .select(
        'invoices.*',
        'users.full_name as customer_name',
        'users.email as customer_email',
        'users.phone as customer_phone'
      )
      .leftJoin('users', 'invoices.user_id', 'users.id')
      .orderBy('invoices.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (status) {
      query = query.where('invoices.status', status);
    }

    if (user_id) {
      query = query.where('invoices.user_id', user_id);
    }

    const invoices = await query;

    res.json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get billing analytics (admin only)
 * GET /api/billing/admin/analytics
 */
router.get('/admin/analytics', authorize('admin'), async (req, res) => {
  try {
    const db = require('../utils/database');

    // Revenue metrics
    const totalRevenue = await db('payments')
      .where('status', 'completed')
      .sum('amount as total')
      .first();

    const monthlyRevenue = await db('payments')
      .where('status', 'completed')
      .where('created_at', '>=', db.raw("date_trunc('month', CURRENT_DATE)"))
      .sum('amount as total')
      .first();

    const weeklyRevenue = await db('payments')
      .where('status', 'completed')
      .where('created_at', '>=', db.raw("date_trunc('week', CURRENT_DATE)"))
      .sum('amount as total')
      .first();

    // Outstanding balances
    const outstandingInvoices = await db('invoices')
      .where('status', '!=', 'paid')
      .sum('balance as total')
      .count('* as count')
      .first();

    // Payment method breakdown
    const paymentMethods = await db('payments')
      .select('payment_method')
      .count('* as count')
      .sum('amount as total')
      .where('status', 'completed')
      .groupBy('payment_method');

    // Recent activity
    const recentInvoices = await db('invoices')
      .select(
        'invoices.invoice_number',
        'invoices.total',
        'invoices.status',
        'invoices.created_at',
        'users.full_name as customer_name'
      )
      .leftJoin('users', 'invoices.user_id', 'users.id')
      .orderBy('invoices.created_at', 'desc')
      .limit(10);

    res.json({
      success: true,
      analytics: {
        revenue: {
          total: parseFloat(totalRevenue.total || 0),
          monthly: parseFloat(monthlyRevenue.total || 0),
          weekly: parseFloat(weeklyRevenue.total || 0)
        },
        outstanding: {
          amount: parseFloat(outstandingInvoices.total || 0),
          count: parseInt(outstandingInvoices.count || 0)
        },
        payment_methods: paymentMethods,
        recent_invoices: recentInvoices
      }
    });
  } catch (error) {
    console.error('Get billing analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;