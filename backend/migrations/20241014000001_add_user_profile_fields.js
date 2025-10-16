/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.text('address').nullable();
    table.date('date_of_birth').nullable();
    // Update payment_mode enum to include cash_on_delivery
    table.dropColumn('payment_mode');
  }).then(() => {
    return knex.schema.alterTable('users', table => {
      table.enum('payment_mode', ['prepaid', 'cash_on_delivery']).defaultTo('cash_on_delivery');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('address');
    table.dropColumn('date_of_birth');
    table.dropColumn('payment_mode');
  }).then(() => {
    return knex.schema.alterTable('users', table => {
      table.enum('payment_mode', ['prepaid', 'postpaid']).defaultTo('postpaid');
    });
  });
};