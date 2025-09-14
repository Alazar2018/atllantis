const fetch = require('node-fetch')
const db = require('../config/database').promise

class WebhookService {
  constructor() {
    this.webhookEndpoints = {
      slack: null,
      discord: null,
      custom: null
    }
  }

  // Set webhook endpoints
  setWebhookEndpoints(endpoints) {
    this.webhookEndpoints = { ...this.webhookEndpoints, ...endpoints }
  }

  // Create notification in database
  async createNotification(type, title, message, data = null) {
    try {
      await db.execute(
        'INSERT INTO notifications (type, title, message, data) VALUES (?, ?, ?, ?)',
        [type, title, message, data ? JSON.stringify(data) : null]
      )
      console.log(`✅ Notification created: ${title}`)
    } catch (error) {
      console.error('❌ Error creating notification:', error)
    }
  }

  // Send order notification webhook
  async sendOrderWebhook(orderData) {
    const payload = {
      event: 'new_order',
      timestamp: new Date().toISOString(),
      order: {
        id: orderData.id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        status: orderData.status,
        created_at: orderData.created_at,
        items: orderData.items || [],
        notes: orderData.notes || ''
      },
      admin_url: `${process.env.FRONTEND_URL}/admin/orders/${orderData.id}`,
      message: `🚨 NEW ORDER #${orderData.id} - ${orderData.customer_name} - ETB ${orderData.total_amount}`
    }

    // Create notification
    await this.createNotification(
      'order',
      'New Order Received',
      `Order #${orderData.id} has been placed by ${orderData.customer_name} for ETB ${orderData.total_amount}`,
      { orderId: orderData.id, customerName: orderData.customer_name, amount: orderData.total_amount }
    )

    return await this.sendWebhooks(payload, 'order')
  }

  // Send low stock notification webhook
  async sendLowStockWebhook(products, threshold) {
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
      message: `⚠️ LOW STOCK ALERT - ${products.length} product${products.length > 1 ? 's' : ''} below ${threshold} units`
    }

    // Create notification
    await this.createNotification(
      'low_stock',
      'Low Stock Alert',
      `${products.length} product${products.length > 1 ? 's' : ''} ${products.length > 1 ? 'are' : 'is'} running low (below ${threshold} units)`,
      { products: products.map(p => ({ id: p.id, title: p.title, stock: p.stock_quantity })), threshold }
    )

    return await this.sendWebhooks(payload, 'stock')
  }

  // Send webhooks to all configured endpoints
  async sendWebhooks(payload, type) {
    const results = []
    
    for (const [platform, url] of Object.entries(this.webhookEndpoints)) {
      if (url) {
        try {
          const result = await this.sendToWebhook(url, payload, platform, type)
          results.push({ platform, success: true, result })
        } catch (error) {
          console.error(`❌ Webhook failed for ${platform}:`, error.message)
          results.push({ platform, success: false, error: error.message })
        }
      }
    }

    return results
  }

  // Send to specific webhook endpoint
  async sendToWebhook(url, payload, platform, type) {
    let webhookPayload = payload

    // Format payload for different platforms
    switch (platform) {
      case 'slack':
        webhookPayload = this.formatSlackMessage(payload, type)
        break
      case 'discord':
        webhookPayload = this.formatDiscordMessage(payload, type)
        break
      case 'custom':
        // Send raw JSON for custom webhooks
        break
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Atlantic-Leather-Admin/1.0',
        'X-Webhook-Type': type,
        'X-Webhook-Platform': platform
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  // Format message for Slack
  formatSlackMessage(payload, type) {
    if (type === 'order') {
      return {
        text: payload.message,
        attachments: [
          {
            color: 'good',
            fields: [
              {
                title: 'Customer',
                value: `${payload.order.customer_name}\n${payload.order.customer_email}\n${payload.order.customer_phone}`,
                short: true
              },
              {
                title: 'Order Details',
                value: `Order #${payload.order.id}\nTotal: ETB ${payload.order.total_amount}\nStatus: ${payload.order.status}`,
                short: true
              },
              {
                title: 'Items',
                value: payload.order.items.map(item => 
                  `• ${item.product_name} (${item.quantity}x) - ETB ${item.price}`
                ).join('\n'),
                short: false
              }
            ],
            actions: [
              {
                type: 'button',
                text: 'View Order',
                url: payload.admin_url,
                style: 'primary'
              }
            ],
            footer: 'Atlantic Leather Admin',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      }
    } else if (type === 'stock') {
      return {
        text: payload.message,
        attachments: [
          {
            color: 'warning',
            fields: [
              {
                title: 'Low Stock Products',
                value: payload.products.map(product => 
                  `• ${product.title} - ${product.stock_quantity} units left`
                ).join('\n'),
                short: false
              },
              {
                title: 'Threshold',
                value: `${payload.threshold} units`,
                short: true
              }
            ],
            actions: [
              {
                type: 'button',
                text: 'Manage Inventory',
                url: payload.admin_url,
                style: 'primary'
              }
            ],
            footer: 'Atlantic Leather Admin',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      }
    }
  }

  // Format message for Discord
  formatDiscordMessage(payload, type) {
    if (type === 'order') {
      return {
        embeds: [
          {
            title: '🚨 New Order Received',
            description: payload.message,
            color: 0x00ff00, // Green
            fields: [
              {
                name: 'Customer',
                value: `${payload.order.customer_name}\n${payload.order.customer_email}\n${payload.order.customer_phone}`,
                inline: true
              },
              {
                name: 'Order Details',
                value: `Order #${payload.order.id}\nTotal: ETB ${payload.order.total_amount}\nStatus: ${payload.order.status}`,
                inline: true
              },
              {
                name: 'Items',
                value: payload.order.items.map(item => 
                  `• ${item.product_name} (${item.quantity}x) - ETB ${item.price}`
                ).join('\n'),
                inline: false
              }
            ],
            timestamp: payload.timestamp,
            footer: {
              text: 'Atlantic Leather Admin'
            },
            url: payload.admin_url
          }
        ]
      }
    } else if (type === 'stock') {
      return {
        embeds: [
          {
            title: '⚠️ Low Stock Alert',
            description: payload.message,
            color: 0xffaa00, // Orange
            fields: [
              {
                name: 'Low Stock Products',
                value: payload.products.map(product => 
                  `• ${product.title} - ${product.stock_quantity} units left`
                ).join('\n'),
                inline: false
              },
              {
                name: 'Threshold',
                value: `${payload.threshold} units`,
                inline: true
              }
            ],
            timestamp: payload.timestamp,
            footer: {
              text: 'Atlantic Leather Admin'
            },
            url: payload.admin_url
          }
        ]
      }
    }
  }

  // Test webhook endpoint
  async testWebhook(url, platform = 'custom') {
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook from Atlantic Leather Admin System',
      admin_url: `${process.env.FRONTEND_URL}/admin`,
      test: true
    }

    try {
      const result = await this.sendToWebhook(url, testPayload, platform, 'test')
      return { success: true, result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

module.exports = new WebhookService()
