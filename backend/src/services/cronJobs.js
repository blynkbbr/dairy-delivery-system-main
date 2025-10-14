const cron = require('node-cron');
const { generateDailyRoutes } = require('./routeOptimization');
const { generateWeeklyInvoices, generateMonthlyInvoices } = require('./billingService');

/**
 * Automated Task Scheduler
 * Handles recurring tasks like route generation, billing, etc.
 */

/**
 * Initialize all cron jobs
 */
function initializeCronJobs() {
  console.log('🕒 Initializing cron jobs...');

  // Generate daily routes at 11 PM for next day
  cron.schedule('0 23 * * *', async () => {
    console.log('⏰ Running daily route generation...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const routes = await generateDailyRoutes(tomorrowStr);
      console.log(`✅ Generated ${routes.length} routes for ${tomorrowStr}`);
    } catch (error) {
      console.error('❌ Daily route generation failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Generate weekly invoices every Monday at 6 AM
  cron.schedule('0 6 * * 1', async () => {
    console.log('⏰ Running weekly invoice generation...');
    try {
      const result = await generateWeeklyInvoices();
      console.log(`✅ Generated ${result.generated} weekly invoices`);
    } catch (error) {
      console.error('❌ Weekly invoice generation failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Generate monthly invoices on 1st of each month at 6 AM
  cron.schedule('0 6 1 * *', async () => {
    console.log('⏰ Running monthly invoice generation...');
    try {
      const result = await generateMonthlyInvoices();
      console.log(`✅ Generated ${result.generated} monthly invoices`);
    } catch (error) {
      console.error('❌ Monthly invoice generation failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Update subscription deliveries daily at 12 AM
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Updating subscription deliveries...');
    try {
      await generateSubscriptionDeliveriesForToday();
      console.log('✅ Subscription deliveries updated');
    } catch (error) {
      console.error('❌ Subscription delivery update failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Clean up old data weekly on Sunday at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    console.log('⏰ Running data cleanup...');
    try {
      await cleanupOldData();
      console.log('✅ Data cleanup completed');
    } catch (error) {
      console.error('❌ Data cleanup failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Check for overdue invoices daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Checking overdue invoices...');
    try {
      await markOverdueInvoices();
      console.log('✅ Overdue invoice check completed');
    } catch (error) {
      console.error('❌ Overdue invoice check failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log('✅ All cron jobs initialized successfully');
}

/**
 * Generate subscription deliveries for today
 */
async function generateSubscriptionDeliveriesForToday() {
  const db = require('../utils/database');
  const moment = require('moment');

  try {
    const today = moment().format('YYYY-MM-DD');
    const dayOfWeek = moment().day();

    // Get active subscriptions that should have delivery today
    const subscriptions = await db('subscriptions')
      .where('status', 'active')
      .where('start_date', '<=', today)
      .where(function() {
        this.whereNull('end_date').orWhere('end_date', '>=', today);
      });

    let deliveriesCreated = 0;

    for (const subscription of subscriptions) {
      const deliveryDays = JSON.parse(subscription.delivery_days);
      
      if (deliveryDays.includes(dayOfWeek)) {
        // Check if delivery already exists
        const existingDelivery = await db('subscription_deliveries')
          .where('subscription_id', subscription.id)
          .where('delivery_date', today)
          .first();

        if (!existingDelivery) {
          const product = await db('products')
            .where('id', subscription.product_id)
            .first();

          if (product && product.status === 'active') {
            await db('subscription_deliveries').insert({
              subscription_id: subscription.id,
              user_id: subscription.user_id,
              address_id: subscription.address_id,
              product_id: subscription.product_id,
              delivery_date: today,
              quantity: subscription.default_quantity,
              unit_price: product.price,
              total_price: parseFloat(product.price) * subscription.default_quantity,
              status: 'scheduled'
            });

            deliveriesCreated++;
          }
        }
      }
    }

    console.log(`Created ${deliveriesCreated} subscription deliveries for ${today}`);
  } catch (error) {
    console.error('Error generating subscription deliveries:', error);
    throw error;
  }
}

/**
 * Mark overdue invoices
 */
async function markOverdueInvoices() {
  const db = require('../utils/database');

  try {
    const today = new Date();
    
    const result = await db('invoices')
      .where('due_date', '<', today)
      .where('status', 'sent')
      .where('balance', '>', 0)
      .update({ status: 'overdue' });

    console.log(`Marked ${result} invoices as overdue`);
  } catch (error) {
    console.error('Error marking overdue invoices:', error);
    throw error;
  }
}

/**
 * Clean up old data
 */
async function cleanupOldData() {
  const db = require('../utils/database');
  const moment = require('moment');

  try {
    const sixMonthsAgo = moment().subtract(6, 'months').toDate();
    const oneYearAgo = moment().subtract(1, 'year').toDate();

    // Clean up old delivered subscription deliveries (keep for 6 months)
    const deletedDeliveries = await db('subscription_deliveries')
      .where('status', 'delivered')
      .where('delivered_at', '<', sixMonthsAgo)
      .del();

    // Clean up old completed routes (keep for 6 months)  
    const oldRouteIds = await db('routes')
      .where('status', 'completed')
      .where('route_date', '<', sixMonthsAgo)
      .pluck('id');

    if (oldRouteIds.length > 0) {
      await db('route_stops').whereIn('route_id', oldRouteIds).del();
      const deletedRoutes = await db('routes').whereIn('id', oldRouteIds).del();
      console.log(`Cleaned up ${deletedRoutes} old routes with their stops`);
    }

    // Clean up old paid invoices (keep for 1 year)
    const deletedInvoices = await db('invoices')
      .where('status', 'paid')
      .where('paid_at', '<', oneYearAgo)
      .del();

    console.log(`Cleaned up: ${deletedDeliveries} deliveries, ${deletedInvoices} invoices`);
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

/**
 * Manual trigger functions for admin
 */
const manualTriggers = {
  generateTodayRoutes: async () => {
    const today = new Date().toISOString().split('T')[0];
    return await generateDailyRoutes(today);
  },
  
  generateTomorrowRoutes: async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return await generateDailyRoutes(tomorrowStr);
  },

  generateWeeklyInvoicesNow: async () => {
    return await generateWeeklyInvoices();
  },

  generateMonthlyInvoicesNow: async () => {
    return await generateMonthlyInvoices();
  },

  updateSubscriptionDeliveries: async () => {
    return await generateSubscriptionDeliveriesForToday();
  },

  markOverdueInvoicesNow: async () => {
    return await markOverdueInvoices();
  },

  cleanupDataNow: async () => {
    return await cleanupOldData();
  }
};

module.exports = {
  initializeCronJobs,
  manualTriggers
};