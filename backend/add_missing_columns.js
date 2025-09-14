require('dotenv').config();
const mysql = require('mysql2/promise');

async function addMissingColumns() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'atlantic_leather_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database successfully');

    // Check if columns exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'
    `, [process.env.DB_NAME || 'atlantic_leather_db']);

    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Existing columns:', columnNames);

    // Add sale_price column if it doesn't exist
    if (!columnNames.includes('sale_price')) {
      console.log('Adding sale_price column...');
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN sale_price DECIMAL(10,2) NULL AFTER original_price
      `);
      console.log('✅ sale_price column added successfully');
    } else {
      console.log('✅ sale_price column already exists');
    }

    // Add original_price column if it doesn't exist
    if (!columnNames.includes('original_price')) {
      console.log('Adding original_price column...');
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN original_price DECIMAL(10,2) NULL AFTER price
      `);
      console.log('✅ original_price column added successfully');
    } else {
      console.log('✅ original_price column already exists');
    }

    console.log('\n🎉 Database schema update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating database schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

addMissingColumns();
