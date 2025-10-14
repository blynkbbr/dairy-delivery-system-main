/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('phone', 15).notNullable().unique();
    table.string('email').nullable();
    table.string('full_name').nullable();
    table.string('google_id').nullable();
    table.enum('role', ['user', 'agent', 'admin']).defaultTo('user');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.string('profile_image').nullable();
    table.decimal('prepaid_balance', 10, 2).defaultTo(0);
    table.enum('payment_mode', ['prepaid', 'postpaid']).defaultTo('postpaid');
    table.timestamps(true, true);
    
    // Indexes
    table.index('phone');
    table.index('email');
    table.index('role');
    table.index('google_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};