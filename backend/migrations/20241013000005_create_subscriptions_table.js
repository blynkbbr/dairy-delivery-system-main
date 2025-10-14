/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('subscriptions', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('address_id').references('id').inTable('addresses').onDelete('SET NULL');
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.integer('default_quantity').notNullable();
      table.json('delivery_days').notNullable(); // Array of days: [0,1,2,3,4,5,6]
      table.date('start_date').notNullable();
      table.date('end_date').nullable();
      table.enum('billing_cycle', ['weekly', 'monthly']).defaultTo('weekly');
      table.enum('payment_mode', ['prepaid', 'postpaid']).defaultTo('postpaid');
      table.enum('status', ['active', 'paused', 'cancelled']).defaultTo('active');
      table.text('notes').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('user_id');
      table.index('status');
      table.index('start_date');
      table.index(['user_id', 'status']);
    })
    .createTable('subscription_deliveries', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('address_id').references('id').inTable('addresses').onDelete('SET NULL');
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.date('delivery_date').notNullable();
      table.integer('quantity').notNullable();
      table.decimal('unit_price', 8, 2).notNullable();
      table.decimal('total_price', 10, 2).notNullable();
      table.enum('status', [
        'scheduled', 
        'out_for_delivery', 
        'delivered', 
        'missed', 
        'cancelled'
      ]).defaultTo('scheduled');
      table.timestamp('delivered_at').nullable();
      table.text('delivery_notes').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('subscription_id');
      table.index('user_id');
      table.index('delivery_date');
      table.index('status');
      table.index(['delivery_date', 'status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('subscription_deliveries')
    .dropTable('subscriptions');
};