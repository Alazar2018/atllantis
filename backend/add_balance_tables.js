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

async function addBalanceTables() {
  try {
    console.log('🔌 Connecting to existing database...');
    
    // Read balance tables script
    const balanceTablesPath = path.join(__dirname, 'database', 'add_balance_tables.sql');
    if (fs.existsSync(balanceTablesPath)) {
      const balanceTablesScript = fs.readFileSync(balanceTablesPath, 'utf8');
      
      console.log('📚 Adding balance and transaction tables...');
      await connection.promise().query(balanceTablesScript);
      console.log('✅ Balance and transaction tables created successfully');
      
      // Test the new tables
      const [balanceResult] = await connection.promise().query('SELECT COUNT(*) as count FROM admin_balance');
      const [transactionsResult] = await connection.promise().query('SELECT COUNT(*) as count FROM transactions');
      
      console.log(`✅ admin_balance table: ${balanceResult[0].count} records`);
      console.log(`✅ transactions table: ${transactionsResult[0].count} records`);
      
    } else {
      console.log('❌ Balance tables script not found');
    }
    
    console.log('\n🎉 Balance tables setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Balance tables setup failed:', error.message);
    
    if (error.code === 'ER_DUP_TABLE_NAME') {
      console.error('\n💡 Tables already exist, this is normal');
    }
    
  } finally {
    connection.end();
  }
}

addBalanceTables();
