const mysql = require('mysql2');
const { spawn } = require('child_process');
const path = require('path');

// Database connection test
const testConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '?}SL$pB5JP;Y',
  database: 'atlantic_leather_db'
});

async function checkDatabase() {
  try {
    console.log('🔌 Testing database connection...');
    await testConnection.promise().query('SELECT 1');
    console.log('✅ Database connection successful');
    testConnection.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database does not exist. Running setup...');
      return await runDatabaseSetup();
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL is not running. Please start MySQL first:');
      console.error('   Windows: Start MySQL service from Services');
      console.error('   macOS: brew services start mysql');
      console.error('   Linux: sudo service mysql start');
      return false;
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Check your MySQL credentials.');
      return false;
    }
    
    return false;
  }
}

async function runDatabaseSetup() {
  return new Promise((resolve) => {
    console.log('🚀 Running database setup...');
    
    const setup = spawn('node', ['setup_database.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    setup.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database setup completed');
        resolve(true);
      } else {
        console.error('❌ Database setup failed');
        resolve(false);
      }
    });
  });
}

async function startServer() {
  try {
    const dbReady = await checkDatabase();
    
    if (!dbReady) {
      console.error('\n❌ Cannot start server without database connection');
      process.exit(1);
    }
    
    console.log('\n🚀 Starting backend server...');
    
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    server.on('close', (code) => {
      console.log(`\n🔄 Server stopped with code ${code}`);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      server.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the development environment
startServer();
