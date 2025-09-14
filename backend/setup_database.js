const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection for setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '?}SL$pB5JP;Y',
  multipleStatements: true
});

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MySQL...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Read admin creation script
    const adminPath = path.join(__dirname, 'database', 'create_admin.sql');
    const adminScript = fs.readFileSync(adminPath, 'utf8');
    
    console.log('📚 Creating database and tables...');
    
    // Execute schema
    await connection.promise().query(schema);
    console.log('✅ Database and tables created successfully');
    
    // Execute admin creation script
    await connection.promise().query(adminScript);
    console.log('✅ Admin user created successfully');
    
    // Read and execute balance tables script
    const balanceTablesPath = path.join(__dirname, 'database', 'add_balance_tables.sql');
    if (fs.existsSync(balanceTablesPath)) {
      const balanceTablesScript = fs.readFileSync(balanceTablesPath, 'utf8');
      await connection.promise().query(balanceTablesScript);
      console.log('✅ Balance and transaction tables created successfully');
    } else {
      console.log('⚠️  Balance tables script not found, skipping...');
    }
    
    // Test the connection to the new database
    const testConnection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '?}SL$pB5JP;Y',
      database: 'atlantic_leather_db'
    });
    
    await testConnection.promise().query('SELECT 1');
    console.log('✅ Database connection test successful');
    
    testConnection.end();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📋 You can now start the backend server with: npm start');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure MySQL is running on your system');
      console.error('   On Windows, check if MySQL service is started');
      console.error('   On macOS/Linux, run: sudo service mysql start');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Check your MySQL username and password');
      console.error('   Update the password in setup_database.js if needed');
    }
    
  } finally {
    connection.end();
  }
}

setupDatabase();
