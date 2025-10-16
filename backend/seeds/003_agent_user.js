/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Check if agent user already exists
  const existingAgent = await knex('users').where('phone', '9876543211').first();
  
  if (!existingAgent) {
    // Insert agent user
    await knex('users').insert([
      {
        id: knex.raw('gen_random_uuid()'),
        phone: '9876543211',
        full_name: 'Agent John',
        email: 'agent@dairydelivery.com',
        role: 'agent',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    
    console.log('✅ Agent user created: Phone 9876543211');
  } else {
    console.log('ℹ️  Agent user already exists');
  }
};