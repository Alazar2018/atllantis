const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '?}SL$pB5JP;Y', // Default to empty password for development
  database: process.env.DB_NAME || 'atlantic_leather_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create promise wrapper
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was lost.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied for database user.');
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist.');
    }
  }
  
  if (connection) {
    connection.release();
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle promise pool errors
promisePool.on('error', (err) => {
  console.error('Unexpected error on promise pool', err);
  process.exit(-1);
});

module.exports = pool;
module.exports.promise = promisePool;
