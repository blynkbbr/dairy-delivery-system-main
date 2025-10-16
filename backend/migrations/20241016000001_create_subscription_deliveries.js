/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasTable('subscription_deliveries').then(exists => {
    if (!exists) {
      return knex.schema.createTable('subscription_deliveries', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.uuid('address_id').references('id').inTable('addresses').onDelete('SET NULL');
    table.uuid('agent_id').references('id').inTable('users').onDelete('SET NULL');
    table.date('delivery_date').notNullable();
    table.time('scheduled_time').nullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']).defaultTo('pending');
    table.timestamp('picked_up_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamp('failed_at').nullable();
    table.text('notes').nullable();
    table.text('delivery_notes').nullable();
    table.string('proof_type').nullable(); // 'photo', 'signature', 'otp'
    table.text('proof_data').nullable();
    table.decimal('customer_rating', 2, 1).nullable(); // 1-5 rating
    table.text('customer_feedback').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('subscription_id');
    table.index('user_id');
    table.index('product_id');
    table.index('agent_id');
    table.index('delivery_date');
    table.index('status');
    table.index(['agent_id', 'delivery_date']);
    table.index(['user_id', 'delivery_date']);
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.hasTable('subscription_deliveries').then(exists => {
    if (exists) {
      return knex.schema.dropTable('subscription_deliveries');
    }
  });
};
