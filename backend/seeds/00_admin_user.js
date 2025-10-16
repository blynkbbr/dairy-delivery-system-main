/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Delete existing admin user
  await knex('users').where({ role: 'admin' }).del();
  
  // Insert hardcoded admin user
  await knex('users').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      phone: '+919999999999', // Admin phone number
      email: 'admin@dairydelivery.com',
      full_name: 'System Administrator',
      role: 'admin',
      status: 'active',
      prepaid_balance: 0,
      payment_mode: 'cash_on_delivery'
    }
  ]);
};