const mysql = require('mysql2');

// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '?}SL$pB5JP;Y',
  database: 'atlantic_leather_db'
});

async function testCustomers() {
  try {
    console.log('🔌 Testing customers API...');
    
    // Test basic connection
    await connection.promise().query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Test orders table structure
    const [ordersColumns] = await connection.promise().query('SHOW COLUMNS FROM orders');
    console.log('✅ Orders table columns:', ordersColumns.map(col => col.Field));
    
    // Test if there are any orders
    const [ordersResult] = await connection.promise().query('SELECT COUNT(*) as count FROM orders');
    console.log('✅ Total orders in database:', ordersResult[0].count);
    
    // Test the customers query
    const [customersResult] = await connection.promise().query(`
      SELECT 
        o.customer_email as email,
        o.customer_name as name,
        o.customer_phone as phone,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status IN ('Confirmed', 'Sold') THEN o.total_amount ELSE 0 END), 0) as total_spent,
        MAX(o.created_at) as last_order_date,
        MIN(o.created_at) as created_at
      FROM orders o
      GROUP BY o.customer_email, o.customer_name, o.customer_phone
      ORDER BY total_spent DESC, total_orders DESC
    `);
    
    console.log('✅ Customers query successful');
    console.log('✅ Found customers:', customersResult.length);
    
    if (customersResult.length > 0) {
      console.log('✅ Sample customer data:');
      console.log(JSON.stringify(customersResult[0], null, 2));
    } else {
      console.log('⚠️  No customers found - this might be normal if no orders exist');
    }
    
    console.log('\n🎉 Customers API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    connection.end();
  }
}

testCustomers();
