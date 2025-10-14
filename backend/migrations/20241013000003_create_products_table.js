/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('products', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('unit').notNullable(); // liter, pack, kg, etc.
    table.decimal('price', 8, 2).notNullable();
    table.boolean('is_milk').defaultTo(false);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.string('image_url').nullable();
    table.integer('stock_quantity').defaultTo(0);
    table.integer('minimum_stock').defaultTo(0);
    table.json('metadata').nullable(); // Additional product data
    table.timestamps(true, true);
    
    // Indexes
    table.index('status');
    table.index('is_milk');
    table.index('name');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('products');
};