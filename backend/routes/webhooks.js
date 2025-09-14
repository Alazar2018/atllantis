const express = require('express')
const router = express.Router()
const db = require('../config/database').promise
const webhookService = require('../services/webhookService')
const { authenticateToken } = require('../middleware/auth')

// Get webhook settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const [settings] = await db.execute(`
      SELECT 
        webhook_notifications_enabled,
        webhook_url,
        slack_webhook_url,
        discord_webhook_url,
        custom_webhook_url
      FROM notification_settings 
      WHERE id = 1
    `)

    if (!settings.length) {
      return res.status(404).json({
        success: false,
        message: 'Webhook settings not found'
      })
    }

    res.json({
      success: true,
      data: settings[0]
    })
  } catch (error) {
    console.error('Error getting webhook settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get webhook settings'
    })
  }
})

// Update webhook settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const {
      webhook_notifications_enabled,
      webhook_url,
      slack_webhook_url,
      discord_webhook_url,
      custom_webhook_url
    } = req.body

    // Validation
    if (webhook_notifications_enabled) {
      const hasAnyWebhook = webhook_url || slack_webhook_url || discord_webhook_url || custom_webhook_url
      if (!hasAnyWebhook) {
        return res.status(400).json({
          success: false,
          message: 'At least one webhook URL is required when webhook notifications are enabled'
        })
      }
    }

    const settings = {
      webhook_notifications_enabled: Boolean(webhook_notifications_enabled),
      webhook_url: webhook_url || null,
      slack_webhook_url: slack_webhook_url || null,
      discord_webhook_url: discord_webhook_url || null,
      custom_webhook_url: custom_webhook_url || null
    }

    await db.execute(`
      INSERT INTO notification_settings (
        id, webhook_notifications_enabled, webhook_url,
        slack_webhook_url, discord_webhook_url, custom_webhook_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        webhook_notifications_enabled = VALUES(webhook_notifications_enabled),
        webhook_url = VALUES(webhook_url),
        slack_webhook_url = VALUES(slack_webhook_url),
        discord_webhook_url = VALUES(discord_webhook_url),
        custom_webhook_url = VALUES(custom_webhook_url),
        updated_at = NOW()
    `, [
      1,
      settings.webhook_notifications_enabled,
      settings.webhook_url,
      settings.slack_webhook_url,
      settings.discord_webhook_url,
      settings.custom_webhook_url
    ])

    // Update webhook service with new endpoints
    webhookService.setWebhookEndpoints({
      slack: settings.slack_webhook_url,
      discord: settings.discord_webhook_url,
      custom: settings.custom_webhook_url
    })

    res.json({
      success: true,
      message: 'Webhook settings updated successfully',
      data: settings
    })
  } catch (error) {
    console.error('Error updating webhook settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update webhook settings'
    })
  }
})

// Test Slack webhook
router.post('/test/slack', authenticateToken, async (req, res) => {
  try {
    const { slack_webhook_url } = req.body

    if (!slack_webhook_url) {
      return res.status(400).json({
        success: false,
        message: 'Slack webhook URL is required'
      })
    }

    const result = await webhookService.testWebhook(slack_webhook_url, 'slack')

    if (result.success) {
      res.json({
        success: true,
        message: 'Slack webhook test successful'
      })
    } else {
      res.status(400).json({
        success: false,
        message: `Slack webhook test failed: ${result.error}`
      })
    }
  } catch (error) {
    console.error('Error testing Slack webhook:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to test Slack webhook'
    })
  }
})

// Test Discord webhook
router.post('/test/discord', authenticateToken, async (req, res) => {
  try {
    const { discord_webhook_url } = req.body

    if (!discord_webhook_url) {
      return res.status(400).json({
        success: false,
        message: 'Discord webhook URL is required'
      })
    }

    const result = await webhookService.testWebhook(discord_webhook_url, 'discord')

    if (result.success) {
      res.json({
        success: true,
        message: 'Discord webhook test successful'
      })
    } else {
      res.status(400).json({
        success: false,
        message: `Discord webhook test failed: ${result.error}`
      })
    }
  } catch (error) {
    console.error('Error testing Discord webhook:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to test Discord webhook'
    })
  }
})

// Test custom webhook
router.post('/test/custom', authenticateToken, async (req, res) => {
  try {
    const { custom_webhook_url } = req.body

    if (!custom_webhook_url) {
      return res.status(400).json({
        success: false,
        message: 'Custom webhook URL is required'
      })
    }

    const result = await webhookService.testWebhook(custom_webhook_url, 'custom')

    if (result.success) {
      res.json({
        success: true,
        message: 'Custom webhook test successful'
      })
    } else {
      res.status(400).json({
        success: false,
        message: `Custom webhook test failed: ${result.error}`
      })
    }
  } catch (error) {
    console.error('Error testing custom webhook:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to test custom webhook'
    })
  }
})

// Manual webhook trigger for orders
router.post('/trigger/order', authenticateToken, async (req, res) => {
  try {
    const { order_id } = req.body

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      })
    }

    // Get order data
    const [orders] = await db.execute(`
      SELECT o.*, 
             GROUP_CONCAT(
               CONCAT(oi.product_name, '|', oi.quantity, '|', oi.price, '|', oi.size, '|', oi.color)
               SEPARATOR '||'
             ) as items_data
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [order_id])

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    const order = orders[0]
    
    // Parse items
    const items = order.items_data ? order.items_data.split('||').map(item => {
      const [name, quantity, price, size, color] = item.split('|')
      return {
        product_name: name,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        size: size || null,
        color: color || null
      }
    }) : []

    const orderData = {
      ...order,
      items
    }

    // Send webhook
    const results = await webhookService.sendOrderWebhook(orderData)

    res.json({
      success: true,
      message: 'Order webhook triggered successfully',
      results
    })
  } catch (error) {
    console.error('Error triggering order webhook:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to trigger order webhook'
    })
  }
})

// Manual webhook trigger for low stock
router.post('/trigger/low-stock', authenticateToken, async (req, res) => {
  try {
    const { threshold } = req.body

    // Get low stock products
    const [products] = await db.execute(`
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
    `, [threshold || 10])

    if (products.length === 0) {
      return res.json({
        success: true,
        message: 'No low stock products found',
        product_count: 0
      })
    }

    // Send webhook
    const results = await webhookService.sendLowStockWebhook(products, threshold || 10)

    res.json({
      success: true,
      message: 'Low stock webhook triggered successfully',
      product_count: products.length,
      results
    })
  } catch (error) {
    console.error('Error triggering low stock webhook:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to trigger low stock webhook'
    })
  }
})

module.exports = router
