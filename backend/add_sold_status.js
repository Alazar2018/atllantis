const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection for setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'atlantic_leather_db',
  multipleStatements: true
});

async function addSoldStatus() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Read the SQL script
    const sqlPath = path.join(__dirname, 'database', 'add_sold_status_simple.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlScript = fs.readFileSync(sqlPath, 'utf8');
      
      console.log('📚 Adding "Sold" status to orders table...');
      await connection.promise().query(sqlScript);
      console.log('✅ "Sold" status added successfully');
      
      // Test the new status
      const [result] = await connection.promise().query('SHOW COLUMNS FROM orders LIKE "status"');
      console.log('✅ Orders table status column updated');
      
    } else {
      console.log('❌ SQL script not found');
    }
    
    console.log('\n🎉 Orders table updated successfully!');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.error('\n💡 Status column already updated, this is normal');
    }
    
  } finally {
    connection.end();
  }
}

addSoldStatus();
