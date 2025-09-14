const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '?}SL$pB5JP;Y',
  database: process.env.DB_NAME || 'atlantic_leather_db'
})

async function setupNotificationTables() {
  try {
    console.log('Setting up notification tables...')

    // Create notification_settings table
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id INT PRIMARY KEY DEFAULT 1,
        low_stock_threshold INT DEFAULT 10,
        email_notifications_enabled BOOLEAN DEFAULT true,
        webhook_notifications_enabled BOOLEAN DEFAULT false,
        webhook_url VARCHAR(500) NULL,
        slack_webhook_url VARCHAR(500) NULL,
        discord_webhook_url VARCHAR(500) NULL,
        custom_webhook_url VARCHAR(500) NULL,
        admin_email VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create notification_logs table
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        product_count INT DEFAULT 0,
        threshold INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      )
    `)

    // Insert default notification settings if they don't exist
    await connection.promise().execute(`
      INSERT IGNORE INTO notification_settings (
        id, low_stock_threshold, email_notifications_enabled, 
        webhook_notifications_enabled, admin_email
      ) VALUES (
        1, 10, true, false, 'molaberiandsons123@gmail.com'
      )
    `)

    console.log('✅ Notification tables created successfully!')
    console.log('📧 Default settings:')
    console.log('   - Low stock threshold: 10 units')
    console.log('   - Email notifications: Enabled')
    console.log('   - Webhook notifications: Disabled')
    console.log('   - Admin email: molaberiandsons123@gmail.com')

  } catch (error) {
    console.error('❌ Error setting up notification tables:', error)
  } finally {
    connection.end()
  }
}

setupNotificationTables()
