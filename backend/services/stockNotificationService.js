const nodemailer = require('nodemailer')
const db = require('../config/database').promise
const webhookService = require('./webhookService')

class StockNotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
  }

  // Check for low stock products
  async checkLowStock() {
    try {
      // Get notification settings
      const [settings] = await db.execute(`
        SELECT 
          low_stock_threshold,
          email_notifications_enabled,
          webhook_notifications_enabled,
          webhook_url,
          slack_webhook_url,
          discord_webhook_url,
          custom_webhook_url,
          admin_email
        FROM notification_settings 
        WHERE id = 1
      `)

      if (!settings.length) {
        console.log('No notification settings found')
        return
      }

      const {
        low_stock_threshold,
        email_notifications_enabled,
        webhook_notifications_enabled,
        webhook_url,
        slack_webhook_url,
        discord_webhook_url,
        custom_webhook_url,
        admin_email
      } = settings[0]

      // Find products with low stock
      const [lowStockProducts] = await db.execute(`
        SELECT 
          p.id,
          p.title,
          p.stock_quantity,
          p.price,
          c.name as category_name,
          pi.image_url
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
        WHERE p.active = 1 
        AND p.stock_quantity <= ?
        ORDER BY p.stock_quantity ASC
      `, [low_stock_threshold])

      if (lowStockProducts.length === 0) {
        return
      }

      console.log(`Found ${lowStockProducts.length} products with low stock`)

      // Send notifications
      const promises = []

      if (email_notifications_enabled && admin_email) {
        promises.push(this.sendEmailNotification(lowStockProducts, admin_email, low_stock_threshold))
      }

      if (webhook_notifications_enabled) {
        // Set webhook endpoints
        webhookService.setWebhookEndpoints({
          slack: slack_webhook_url,
          discord: discord_webhook_url,
          custom: custom_webhook_url
        })
        
        // Send webhook notification
        promises.push(webhookService.sendLowStockWebhook(lowStockProducts, low_stock_threshold))
      }

      await Promise.all(promises)

      // Log notification sent
      await this.logNotification(lowStockProducts.length, low_stock_threshold)

    } catch (error) {
      console.error('Error checking low stock:', error)
    }
  }

  // Send email notification
  async sendEmailNotification(products, adminEmail, threshold) {
    try {
      const productList = products.map(product => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${product.title}</strong><br>
            <small>Category: ${product.category_name}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${product.stock_quantity} units
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ETB ${product.price}
          </td>
        </tr>
      `).join('')

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Low Stock Alert - Atlantic Leather</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">⚠️ Low Stock Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Atlantic Leather Inventory Management</p>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #ddd; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>Alert:</strong> ${products.length} product${products.length > 1 ? 's' : ''} 
                ${products.length > 1 ? 'have' : 'has'} fallen below the stock threshold of 
                <strong>${threshold} units</strong>.
              </p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Stock</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${productList}
                </tbody>
              </table>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>Action Required:</strong> Please review your inventory and consider restocking these items to avoid stockouts.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/admin/products" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Manage Inventory
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">This is an automated notification from Atlantic Leather Admin System</p>
              <p style="margin: 5px 0 0 0;">Generated at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `

      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: adminEmail,
        subject: `🚨 Low Stock Alert - ${products.length} Product${products.length > 1 ? 's' : ''} Need Attention`,
        html: htmlContent
      })

      console.log(`Low stock email sent to ${adminEmail}`)
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  // Send webhook notification
  async sendWebhookNotification(products, webhookUrl, threshold) {
    try {
      const payload = {
        event: 'low_stock_alert',
        timestamp: new Date().toISOString(),
        threshold: threshold,
        product_count: products.length,
        products: products.map(product => ({
          id: product.id,
          title: product.title,
          stock_quantity: product.stock_quantity,
          price: product.price,
          category: product.category_name,
          image_url: product.image_url
        })),
        admin_url: `${process.env.FRONTEND_URL}/admin/products`,
        message: `${products.length} product${products.length > 1 ? 's' : ''} ${products.length > 1 ? 'have' : 'has'} fallen below the stock threshold of ${threshold} units`
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Atlantic-Leather-Admin/1.0'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        console.log(`Webhook notification sent successfully to ${webhookUrl}`)
      } else {
        console.error(`Webhook notification failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error sending webhook notification:', error)
    }
  }

  // Log notification
  async logNotification(productCount, threshold) {
    try {
      await db.execute(`
        INSERT INTO notification_logs (type, message, product_count, threshold, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [
        'low_stock',
        `Low stock alert sent for ${productCount} products`,
        productCount,
        threshold
      ])
    } catch (error) {
      console.error('Error logging notification:', error)
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const [settings] = await db.execute(`
        SELECT * FROM notification_settings WHERE id = 1
      `)
      return settings[0] || null
    } catch (error) {
      console.error('Error getting notification settings:', error)
      return null
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      await db.execute(`
        INSERT INTO notification_settings (
          id, low_stock_threshold, email_notifications_enabled, 
          webhook_notifications_enabled, webhook_url, admin_email, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          low_stock_threshold = VALUES(low_stock_threshold),
          email_notifications_enabled = VALUES(email_notifications_enabled),
          webhook_notifications_enabled = VALUES(webhook_notifications_enabled),
          webhook_url = VALUES(webhook_url),
          admin_email = VALUES(admin_email),
          updated_at = NOW()
      `, [
        1,
        settings.low_stock_threshold,
        settings.email_notifications_enabled,
        settings.webhook_notifications_enabled,
        settings.webhook_url,
        settings.admin_email
      ])
      return true
    } catch (error) {
      console.error('Error updating notification settings:', error)
      return false
    }
  }
}

module.exports = new StockNotificationService()
