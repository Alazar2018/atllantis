const express = require('express')
const router = express.Router()
const db = require('../config/database').promise
const stockNotificationService = require('../services/stockNotificationService')
const { authenticateToken } = require('../middleware/auth')

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await stockNotificationService.getNotificationSettings()
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Notification settings not found'
      })
    }

    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error getting notification settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get notification settings'
    })
  }
})

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const {
      low_stock_threshold,
      email_notifications_enabled,
      webhook_notifications_enabled,
      webhook_url,
      admin_email
    } = req.body

    // Validation
    if (low_stock_threshold < 0 || low_stock_threshold > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Low stock threshold must be between 0 and 1000'
      })
    }

    if (email_notifications_enabled && !admin_email) {
      return res.status(400).json({
        success: false,
        message: 'Admin email is required when email notifications are enabled'
      })
    }

    if (webhook_notifications_enabled && !webhook_url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is required when webhook notifications are enabled'
      })
    }

    const settings = {
      low_stock_threshold: parseInt(low_stock_threshold),
      email_notifications_enabled: Boolean(email_notifications_enabled),
      webhook_notifications_enabled: Boolean(webhook_notifications_enabled),
      webhook_url: webhook_url || null,
      admin_email: admin_email || null
    }

    const success = await stockNotificationService.updateNotificationSettings(settings)

    if (success) {
      res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: settings
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update notification settings'
      })
    }
  } catch (error) {
    console.error('Error updating notification settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    })
  }
})

// Test email notification
router.post('/test-email', authenticateToken, async (req, res) => {
  try {
    const { admin_email } = req.body

    if (!admin_email) {
      return res.status(400).json({
        success: false,
        message: 'Admin email is required'
      })
    }

    // Create a test product for the email
    const testProducts = [{
      id: 999,
      title: 'Test Product - Low Stock Alert',
      stock_quantity: 5,
      price: 100,
      category_name: 'Test Category',
      image_url: null
    }]

    await stockNotificationService.sendEmailNotification(testProducts, admin_email, 10)

    res.json({
      success: true,
      message: 'Test email sent successfully'
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    })
  }
})

// Test webhook notification
router.post('/test-webhook', authenticateToken, async (req, res) => {
  try {
    const { webhook_url } = req.body

    if (!webhook_url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is required'
      })
    }

    // Create a test product for the webhook
    const testProducts = [{
      id: 999,
      title: 'Test Product - Low Stock Alert',
      stock_quantity: 5,
      price: 100,
      category_name: 'Test Category',
      image_url: null
    }]

    await stockNotificationService.sendWebhookNotification(testProducts, webhook_url, 10)

    res.json({
      success: true,
      message: 'Test webhook sent successfully'
    })
  } catch (error) {
    console.error('Error sending test webhook:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send test webhook'
    })
  }
})

// Get notification logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT * FROM notification_logs
    `
    let countQuery = `
      SELECT COUNT(*) as total FROM notification_logs
    `

    const params = []
    const countParams = []

    if (type) {
      query += ` WHERE type = ?`
      countQuery += ` WHERE type = ?`
      params.push(type)
      countParams.push(type)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(parseInt(limit), parseInt(offset))

    const [logs] = await db.execute(query, params)
    const [countResult] = await db.execute(countQuery, countParams)
    const total = countResult[0].total

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error getting notification logs:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get notification logs'
    })
  }
})

// Manual low stock check
router.post('/check-low-stock', authenticateToken, async (req, res) => {
  try {
    await stockNotificationService.checkLowStock()
    
    res.json({
      success: true,
      message: 'Low stock check completed'
    })
  } catch (error) {
    console.error('Error checking low stock:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check low stock'
    })
  }
})

module.exports = router
