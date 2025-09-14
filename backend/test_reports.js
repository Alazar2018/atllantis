const mysql = require('mysql2');

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'atlantic_leather_db'
});

async function testReports() {
  try {
    console.log('🔌 Testing database connection and reports...');
    
    // Test basic connection
    await connection.promise().query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Test orders table structure
    const [ordersColumns] = await connection.promise().query('SHOW COLUMNS FROM orders');
    console.log('✅ Orders table columns:', ordersColumns.map(col => col.Field));
    
    // Test balance table
    const [balanceResult] = await connection.promise().query('SELECT COUNT(*) as count FROM admin_balance');
    console.log('✅ Admin balance table:', balanceResult[0].count, 'records');
    
    // Test transactions table
    const [transactionsResult] = await connection.promise().query('SELECT COUNT(*) as count FROM transactions');
    console.log('✅ Transactions table:', transactionsResult[0].count, 'records');
    
    // Test basic reports query
    const [productsResult] = await connection.promise().query('SELECT COUNT(*) as total FROM products WHERE active = TRUE');
    console.log('✅ Products count:', productsResult[0].total);
    
    const [ordersResult] = await connection.promise().query('SELECT COUNT(*) as total FROM orders');
    console.log('✅ Orders count:', ordersResult[0].total);
    
    const [customersResult] = await connection.promise().query('SELECT COUNT(DISTINCT customer_email) as total FROM orders');
    console.log('✅ Customers count:', customersResult[0].total);
    
    console.log('\n🎉 All tests passed! Database is ready for reports.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    connection.end();
  }
}

testReports();
