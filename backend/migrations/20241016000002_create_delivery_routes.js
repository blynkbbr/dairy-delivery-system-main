/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('delivery_routes', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('agent_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('route_name').notNullable();
    table.date('route_date').notNullable();
    table.enum('status', ['planned', 'in_progress', 'completed', 'cancelled']).defaultTo('planned');
    table.time('start_time').nullable();
    table.time('end_time').nullable();
    table.decimal('total_distance', 8, 2).nullable(); // in km
    table.integer('estimated_duration').nullable(); // in minutes
    table.json('start_location').nullable(); // {lat, lng, address}
    table.json('route_points').nullable(); // Array of delivery locations
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('agent_id');
    table.index('route_date');
    table.index('status');
    table.index(['agent_id', 'route_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('delivery_routes');
};