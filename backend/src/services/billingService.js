const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

/**
 * Billing and Invoice Service
 * Handles invoice generation, payment processing, and billing cycles
 */

/**
 * Generate invoice for a user's subscription deliveries
 */
async function generateInvoice(userId, periodStart, periodEnd, billingCycle = 'weekly') {
  const db = require('../utils/database');
  
  try {
    // Get user details
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw new Error('User not found');
    }

    // Get delivered subscription items for the period
    const deliveries = await db('subscription_deliveries')
      .select(
        'subscription_deliveries.*',
        'products.name as product_name',
        'products.unit as product_unit'
      )
      .join('products', 'subscription_deliveries.product_id', 'products.id')
      .where('subscription_deliveries.user_id', userId)
      .where('subscription_deliveries.status', 'delivered')
      .whereBetween('subscription_deliveries.delivery_date', [periodStart, periodEnd])
      .whereNull('subscription_deliveries.invoice_id'); // Not already invoiced

    if (deliveries.length === 0) {
      return null; // No deliveries to invoice
    }

    // Calculate totals
    const subtotal = deliveries.reduce((sum, delivery) => sum + parseFloat(delivery.total_price), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Create line items
    const lineItems = deliveries.map(delivery => ({
      date: delivery.delivery_date,
      description: `${delivery.product_name} (${delivery.quantity} ${delivery.product_unit})`,
      quantity: delivery.quantity,
      unit_price: delivery.unit_price,
      total: delivery.total_price
    }));

    // Create invoice
    const [invoice] = await db('invoices')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
        due_date: moment().add(billingCycle === 'weekly' ? 7 : 30, 'days').toDate(),
        period_start: periodStart,
        period_end: periodEnd,
        subtotal: subtotal,
        tax: tax,
        total: total,
        balance: total,
        status: 'sent',
        line_items: JSON.stringify(lineItems),
        sent_at: new Date()
      })
      .returning('*');

    // Update deliveries to link with invoice
    await db('subscription_deliveries')
      .whereIn('id', deliveries.map(d => d.id))
      .update({ invoice_id: invoice.id });

    // Create ledger entry for invoice
    await createLedgerEntry(userId, 'debit', total, `Invoice ${invoiceNumber}`, invoice.id);

    // Handle prepaid users
    if (user.payment_mode === 'prepaid') {
      await processPrepaidInvoice(userId, invoice.id, total);
    }

    return {
      ...invoice,
      line_items: lineItems
    };
  } catch (error) {
    console.error('Generate invoice error:', error);
    throw error;
  }
}

/**
 * Process payment for prepaid users
 */
async function processPrepaidInvoice(userId, invoiceId, amount) {
  const db = require('../utils/database');
  
  try {
    const user = await db('users').where('id', userId).first();
    const prepaidBalance = parseFloat(user.prepaid_balance);

    if (prepaidBalance >= amount) {
      // Deduct from prepaid balance
      await db('users')
        .where('id', userId)
        .decrement('prepaid_balance', amount);

      // Mark invoice as paid
      await db('invoices')
        .where('id', invoiceId)
        .update({
          paid_amount: amount,
          balance: 0,
          status: 'paid',
          paid_at: new Date()
        });

      // Create payment record
      await db('payments').insert({
        user_id: userId,
        invoice_id: invoiceId,
        amount: amount,
        payment_method: 'prepaid_balance',
        payment_type: 'invoice_payment',
        status: 'completed',
        processed_at: new Date()
      });

      // Create ledger entry for payment
      await createLedgerEntry(userId, 'credit', amount, `Payment via prepaid balance`, null, null, invoiceId);

      return { success: true, message: 'Invoice paid from prepaid balance' };
    } else {
      // Insufficient balance - partial payment or send notification
      if (prepaidBalance > 0) {
        await db('users')
          .where('id', userId)
          .update({ prepaid_balance: 0 });

        await db('invoices')
          .where('id', invoiceId)
          .update({
            paid_amount: prepaidBalance,
            balance: amount - prepaidBalance
          });

        await db('payments').insert({
          user_id: userId,
          invoice_id: invoiceId,
          amount: prepaidBalance,
          payment_method: 'prepaid_balance',
          payment_type: 'invoice_payment',
          status: 'completed',
          processed_at: new Date(),
          notes: 'Partial payment - insufficient balance'
        });

        await createLedgerEntry(userId, 'credit', prepaidBalance, `Partial payment via prepaid balance`, null, null, invoiceId);
      }

      return { 
        success: false, 
        message: 'Insufficient prepaid balance', 
        remaining_balance: amount - prepaidBalance 
      };
    }
  } catch (error) {
    console.error('Process prepaid invoice error:', error);
    throw error;
  }
}

/**
 * Top up prepaid balance
 */
async function topupPrepaidBalance(userId, amount, paymentMethod = 'card') {
  const db = require('../utils/database');
  
  try {
    // Increment user's prepaid balance
    await db('users')
      .where('id', userId)
      .increment('prepaid_balance', amount);

    // Create payment record
    const [payment] = await db('payments')
      .insert({
        user_id: userId,
        amount: amount,
        payment_method: paymentMethod,
        payment_type: 'prepaid_topup',
        status: 'completed',
        processed_at: new Date()
      })
      .returning('*');

    // Create ledger entry
    await createLedgerEntry(userId, 'credit', amount, `Prepaid balance topup`, payment.id);

    return payment;
  } catch (error) {
    console.error('Topup prepaid balance error:', error);
    throw error;
  }
}

/**
 * Create ledger entry
 */
async function createLedgerEntry(userId, entryType, amount, description, paymentId = null, orderId = null, invoiceId = null, subscriptionDeliveryId = null) {
  const db = require('../utils/database');
  
  try {
    // Get current balance
    const lastEntry = await db('ledger_entries')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .first();

    const currentBalance = lastEntry ? parseFloat(lastEntry.running_balance) : 0;
    const newBalance = entryType === 'debit' 
      ? currentBalance + parseFloat(amount)
      : currentBalance - parseFloat(amount);

    await db('ledger_entries').insert({
      user_id: userId,
      invoice_id: invoiceId,
      payment_id: paymentId,
      order_id: orderId,
      subscription_delivery_id: subscriptionDeliveryId,
      entry_type: entryType,
      amount: amount,
      running_balance: newBalance,
      description: description,
      reference_number: generateReferenceNumber()
    });

    return { success: true };
  } catch (error) {
    console.error('Create ledger entry error:', error);
    throw error;
  }
}

/**
 * Generate weekly invoices for all users
 */
async function generateWeeklyInvoices() {
  const db = require('../utils/database');
  
  try {
    // Get all users with weekly billing cycle
    const users = await db('users')
      .join('subscriptions', 'users.id', 'subscriptions.user_id')
      .where('subscriptions.billing_cycle', 'weekly')
      .where('subscriptions.status', 'active')
      .distinct('users.id', 'users.full_name', 'users.email')
      .select('users.id', 'users.full_name', 'users.email');

    const invoices = [];
    const periodEnd = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const periodStart = moment().subtract(1, 'week').format('YYYY-MM-DD');

    for (const user of users) {
      try {
        const invoice = await generateInvoice(user.id, periodStart, periodEnd, 'weekly');
        if (invoice) {
          invoices.push(invoice);
        }
      } catch (error) {
        console.error(`Error generating invoice for user ${user.id}:`, error);
      }
    }

    return {
      success: true,
      generated: invoices.length,
      period: { start: periodStart, end: periodEnd }
    };
  } catch (error) {
    console.error('Generate weekly invoices error:', error);
    throw error;
  }
}

/**
 * Generate monthly invoices for all users
 */
async function generateMonthlyInvoices() {
  const db = require('../utils/database');
  
  try {
    // Get all users with monthly billing cycle
    const users = await db('users')
      .join('subscriptions', 'users.id', 'subscriptions.user_id')
      .where('subscriptions.billing_cycle', 'monthly')
      .where('subscriptions.status', 'active')
      .distinct('users.id', 'users.full_name', 'users.email')
      .select('users.id', 'users.full_name', 'users.email');

    const invoices = [];
    const periodEnd = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const periodStart = moment().subtract(1, 'month').format('YYYY-MM-DD');

    for (const user of users) {
      try {
        const invoice = await generateInvoice(user.id, periodStart, periodEnd, 'monthly');
        if (invoice) {
          invoices.push(invoice);
        }
      } catch (error) {
        console.error(`Error generating invoice for user ${user.id}:`, error);
      }
    }

    return {
      success: true,
      generated: invoices.length,
      period: { start: periodStart, end: periodEnd }
    };
  } catch (error) {
    console.error('Generate monthly invoices error:', error);
    throw error;
  }
}

/**
 * Get user's billing summary
 */
async function getUserBillingSummary(userId) {
  const db = require('../utils/database');
  
  try {
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw new Error('User not found');
    }

    // Get recent invoices
    const invoices = await db('invoices')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(10);

    // Get outstanding balance
    const outstandingBalance = await db('invoices')
      .where('user_id', userId)
      .where('status', '!=', 'paid')
      .sum('balance as total')
      .first();

    // Get recent payments
    const payments = await db('payments')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(10);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        payment_mode: user.payment_mode,
        prepaid_balance: parseFloat(user.prepaid_balance)
      },
      outstanding_balance: parseFloat(outstandingBalance.total || 0),
      invoices,
      payments
    };
  } catch (error) {
    console.error('Get user billing summary error:', error);
    throw error;
  }
}

/**
 * Helper functions
 */
function generateInvoiceNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

function generateReferenceNumber() {
  return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

module.exports = {
  generateInvoice,
  processPrepaidInvoice,
  topupPrepaidBalance,
  createLedgerEntry,
  generateWeeklyInvoices,
  generateMonthlyInvoices,
  getUserBillingSummary
};