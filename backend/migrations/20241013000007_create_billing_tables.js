/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('invoices', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('invoice_number').unique().notNullable();
      table.date('invoice_date').notNullable();
      table.date('due_date').notNullable();
      table.date('period_start').notNullable();
      table.date('period_end').notNullable();
      table.decimal('subtotal', 10, 2).notNullable();
      table.decimal('tax', 10, 2).defaultTo(0);
      table.decimal('total', 10, 2).notNullable();
      table.decimal('paid_amount', 10, 2).defaultTo(0);
      table.decimal('balance', 10, 2).notNullable();
      table.enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']).defaultTo('draft');
      table.json('line_items').notNullable(); // Array of invoice line items
      table.text('notes').nullable();
      table.timestamp('sent_at').nullable();
      table.timestamp('paid_at').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('user_id');
      table.index('invoice_number');
      table.index('status');
      table.index('due_date');
      table.index(['user_id', 'status']);
    })
    .createTable('payments', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('invoice_id').references('id').inTable('invoices').onDelete('SET NULL');
      table.string('payment_id').unique().nullable(); // External payment gateway ID
      table.decimal('amount', 10, 2).notNullable();
      table.enum('payment_method', ['cash', 'card', 'upi', 'netbanking', 'wallet']).notNullable();
      table.enum('payment_type', ['invoice_payment', 'prepaid_topup', 'refund']).notNullable();
      table.enum('status', ['pending', 'completed', 'failed', 'refunded']).defaultTo('pending');
      table.json('payment_details').nullable(); // Gateway-specific data
      table.text('notes').nullable();
      table.timestamp('processed_at').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('user_id');
      table.index('invoice_id');
      table.index('payment_id');
      table.index('status');
      table.index(['user_id', 'status']);
    })
    .createTable('ledger_entries', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('invoice_id').references('id').inTable('invoices').onDelete('SET NULL');
      table.uuid('payment_id').references('id').inTable('payments').onDelete('SET NULL');
      table.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL');
      table.uuid('subscription_delivery_id').references('id').inTable('subscription_deliveries').onDelete('SET NULL');
      table.enum('entry_type', ['debit', 'credit']).notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.decimal('running_balance', 10, 2).notNullable();
      table.string('description').notNullable();
      table.string('reference_number').nullable();
      table.json('metadata').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('user_id');
      table.index('entry_type');
      table.index('created_at');
      table.index(['user_id', 'created_at']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('ledger_entries')
    .dropTable('payments')
    .dropTable('invoices');
};