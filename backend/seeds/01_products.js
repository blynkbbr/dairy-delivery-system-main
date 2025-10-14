/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  
  // Insert sample products
  await knex('products').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Fresh Cow Milk',
      description: 'Fresh organic cow milk delivered daily',
      unit: 'liter',
      price: 45.00,
      is_milk: true,
      status: 'active',
      stock_quantity: 100,
      minimum_stock: 10
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Buffalo Milk',
      description: 'Rich and creamy buffalo milk',
      unit: 'liter',
      price: 55.00,
      is_milk: true,
      status: 'active',
      stock_quantity: 80,
      minimum_stock: 10
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Organic Curd',
      description: 'Fresh homemade organic curd',
      unit: 'pack (500g)',
      price: 35.00,
      is_milk: false,
      status: 'active',
      stock_quantity: 50,
      minimum_stock: 5
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Fresh Paneer',
      description: 'Soft and fresh paneer made daily',
      unit: 'pack (250g)',
      price: 120.00,
      is_milk: false,
      status: 'active',
      stock_quantity: 30,
      minimum_stock: 5
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Pure Ghee',
      description: 'Traditional pure cow ghee',
      unit: 'jar (500ml)',
      price: 450.00,
      is_milk: false,
      status: 'active',
      stock_quantity: 25,
      minimum_stock: 3
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Butter',
      description: 'Fresh homemade butter',
      unit: 'pack (200g)',
      price: 80.00,
      is_milk: false,
      status: 'active',
      stock_quantity: 40,
      minimum_stock: 5
    }
  ]);
};