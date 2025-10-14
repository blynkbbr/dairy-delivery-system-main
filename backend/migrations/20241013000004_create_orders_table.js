/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('orders', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('address_id').references('id').inTable('addresses').onDelete('SET NULL');
      table.string('order_number').unique().notNullable();
      table.decimal('subtotal', 10, 2).notNullable();
      table.decimal('delivery_fee', 10, 2).defaultTo(0);
      table.decimal('tax', 10, 2).defaultTo(0);
      table.decimal('total', 10, 2).notNullable();
      table.enum('status', [
        'pending', 
        'confirmed', 
        'processing', 
        'out_for_delivery', 
        'delivered', 
        'cancelled',
        'refunded'
      ]).defaultTo('pending');
      table.string('tracking_number').nullable();
      table.string('carrier').nullable();
      table.text('notes').nullable();
      table.timestamp('confirmed_at').nullable();
      table.timestamp('delivered_at').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('user_id');
      table.index('status');
      table.index('order_number');
      table.index('created_at');
    })
    .createTable('order_items', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.integer('quantity').notNullable();
      table.decimal('unit_price', 8, 2).notNullable();
      table.decimal('total_price', 10, 2).notNullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('order_id');
      table.index('product_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('order_items')
    .dropTable('orders');
};