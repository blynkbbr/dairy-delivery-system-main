/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('addresses', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('line1').notNullable();
    table.string('line2').nullable();
    table.string('area').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('pincode', 10).notNullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.boolean('is_default').defaultTo(false);
    table.string('label').nullable(); // Home, Office, etc.
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index(['latitude', 'longitude']);
    table.index('pincode');
    table.index('city');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('addresses');
};