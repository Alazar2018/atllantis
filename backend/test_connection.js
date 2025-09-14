const mysql = require('mysql2');

// Test database connection
async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    // Test basic connection
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '?}SL$pB5JP;Y',
      database: 'atlantic_leather_db'
    });
    
    console.log('✅ Connected to database successfully');
    
    // Test basic query
    const [rows] = await connection.promise().query('SELECT 1 as test');
    console.log('✅ Basic query test passed:', rows[0]);
    
    // Test if tables exist
    const [tables] = await connection.promise().query('SHOW TABLES');
    console.log('✅ Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Test categories table
    try {
      const [categories] = await connection.promise().query('SELECT COUNT(*) as count FROM categories');
      console.log('✅ Categories table accessible:', categories[0].count, 'categories found');
    } catch (error) {
      console.error('❌ Categories table error:', error.message);
    }
    
    // Test products table
    try {
      const [products] = await connection.promise().query('SELECT COUNT(*) as count FROM products');
      console.log('✅ Products table accessible:', products[0].count, 'products found');
    } catch (error) {
      console.error('❌ Products table error:', error.message);
    }
    
    // Test orders table
    try {
      const [orders] = await connection.promise().query('SELECT COUNT(*) as count FROM orders');
      console.log('✅ Orders table accessible:', orders[0].count, 'orders found');
    } catch (error) {
      console.error('❌ Orders table error:', error.message);
    }
    
    connection.end();
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL is not running. Please start MySQL first:');
      console.error('   Windows: Start MySQL service from Services (services.msc)');
      console.error('   macOS: brew services start mysql');
      console.error('   Linux: sudo service mysql start');
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist. Run the setup script:');
      console.error('   npm run setup');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Check your MySQL credentials.');
    }
  }
}

testConnection();
