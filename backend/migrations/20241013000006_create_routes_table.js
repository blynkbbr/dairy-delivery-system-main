/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('routes', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('agent_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('route_name').notNullable();
      table.date('route_date').notNullable();
      table.enum('status', ['planned', 'in_progress', 'completed', 'cancelled']).defaultTo('planned');
      table.time('start_time').nullable();
      table.time('end_time').nullable();
      table.decimal('total_distance', 8, 2).nullable(); // in km
      table.integer('estimated_duration').nullable(); // in minutes
      table.json('depot_location').nullable(); // {lat, lng, address}
      table.text('notes').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('agent_id');
      table.index('route_date');
      table.index('status');
      table.index(['agent_id', 'route_date']);
    })
    .createTable('route_stops', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('route_id').references('id').inTable('routes').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('address_id').references('id').inTable('addresses').onDelete('SET NULL');
      table.uuid('subscription_delivery_id').references('id').inTable('subscription_deliveries').onDelete('SET NULL');
      table.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL');
      table.integer('sequence').notNullable();
      table.enum('stop_type', ['subscription', 'order']).notNullable();
      table.json('delivery_items').notNullable(); // Array of {product_id, quantity, unit_price}
      table.decimal('total_amount', 10, 2).notNullable();
      table.enum('status', ['pending', 'in_transit', 'delivered', 'missed', 'cancelled']).defaultTo('pending');
      table.timestamp('arrived_at').nullable();
      table.timestamp('delivered_at').nullable();
      table.text('delivery_notes').nullable();
      table.string('proof_image').nullable();
      table.decimal('customer_rating', 2, 1).nullable(); // 1-5 rating
      table.timestamps(true, true);
      
      // Indexes
      table.index('route_id');
      table.index('user_id');
      table.index('status');
      table.index(['route_id', 'sequence']);
      table.index('subscription_delivery_id');
      table.index('order_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('route_stops')
    .dropTable('routes');
};