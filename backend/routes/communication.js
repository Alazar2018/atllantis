const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const db = require('../config/database').promise;

const router = express.Router();

// Configure nodemailer for email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Configure Twilio for SMS
const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// Send order confirmation email
router.post('/email/order-confirmation', [
  authenticateToken,
  requireAuth,
  body('order_id').isInt().withMessage('Valid order ID is required'),
  body('email_type').isIn(['confirmation', 'status_update', 'shipping', 'delivery']).withMessage('Valid email type is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { order_id, email_type, custom_message } = req.body;
    
    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `;
    
    db.query(orderQuery, [order_id], async (err, orderResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: true,
          message: 'Database error occurred'
        });
      }
      
      if (orderResults.length === 0) {
        return res.status(404).json({
          error: true,
          message: 'Order not found'
        });
      }
      
      const order = orderResults[0];
      
      // Get order items
      const itemsQuery = `
        SELECT 
          oi.*,
          p.name as product_name,
          p.image as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      
      db.query(itemsQuery, [order_id], async (err, items) => {
        if (err) {
          console.error('Items error:', err);
        }
        
        order.items = items || [];
        
        // Generate email content based on type
        let subject, htmlContent;
        
        switch (email_type) {
          case 'confirmation':
            subject = `Order Confirmation - ${order.order_number}`;
            htmlContent = generateOrderConfirmationEmail(order, custom_message);
            break;
          case 'status_update':
            subject = `Order Status Update - ${order.order_number}`;
            htmlContent = generateStatusUpdateEmail(order, custom_message);
            break;
          case 'shipping':
            subject = `Order Shipped - ${order.order_number}`;
            htmlContent = generateShippingEmail(order, custom_message);
            break;
          case 'delivery':
            subject = `Order Delivered - ${order.order_number}`;
            htmlContent = generateDeliveryEmail(order, custom_message);
            break;
          default:
            subject = `Order Update - ${order.order_number}`;
            htmlContent = generateGenericEmail(order, custom_message);
        }
        
        try {
          // Send email
          const transporter = createTransporter();
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: order.customer_email,
            subject: subject,
            html: htmlContent
          };
          
          const info = await transporter.sendMail(mailOptions);
          
          // Log communication
          const logQuery = `
            INSERT INTO communication_logs (
              order_id, type, recipient, subject, message, status, delivered_at
            ) VALUES (?, 'email', ?, ?, ?, 'delivered', NOW())
          `;
          
          db.query(logQuery, [
            order_id, order.customer_email, subject, htmlContent
          ], (err, logResult) => {
            if (err) {
              console.error('Log error:', err);
            }
          });
          
          res.json({
            error: false,
            message: 'Email sent successfully',
            messageId: info.messageId
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
          
          // Log failed communication
          const logQuery = `
            INSERT INTO communication_logs (
              order_id, type, recipient, subject, message, status, error_message
            ) VALUES (?, 'email', ?, ?, ?, 'failed', ?)
          `;
          
          db.query(logQuery, [
            order_id, order.customer_email, subject, htmlContent, emailError.message
          ], (err, logResult) => {
            if (err) {
              console.error('Log error:', err);
            }
          });
          
          res.status(500).json({
            error: true,
            message: 'Failed to send email',
            error: emailError.message
          });
        }
      });
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Send SMS notification
router.post('/sms/send', [
  authenticateToken,
  requireAuth,
  body('phone_number').notEmpty().withMessage('Phone number is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('order_id').optional().isInt().withMessage('Valid order ID is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { phone_number, message, order_id } = req.body;
    
    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid phone number format'
      });
    }
    
    // Send SMS using Twilio
    const twilioClient = createTwilioClient();
    if (!twilioClient) {
      return res.status(500).json({
        error: true,
        message: 'SMS service not configured'
      });
    }
    
    try {
      const smsResult = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone_number
      });
      
      // Log successful SMS
      const logQuery = `
        INSERT INTO communication_logs (
          order_id, type, recipient, message, status, delivered_at
        ) VALUES (?, 'sms', ?, ?, 'delivered', NOW())
      `;
      
      db.query(logQuery, [order_id, phone_number, message], (err, logResult) => {
        if (err) {
          console.error('Log error:', err);
        }
      });
      
      res.json({
        error: false,
        message: 'SMS sent successfully',
        messageId: smsResult.sid
      });
    } catch (smsError) {
      console.error('SMS error:', smsError);
      
      // Log failed SMS
      const logQuery = `
        INSERT INTO communication_logs (
          order_id, type, recipient, message, status, error_message
        ) VALUES (?, 'sms', ?, ?, 'failed', ?)
      `;
      
      db.query(logQuery, [order_id, phone_number, message, smsError.message], (err, logResult) => {
        if (err) {
          console.error('Log error:', err);
        }
      });
      
      res.status(500).json({
        error: true,
        message: 'Failed to send SMS',
        error: smsError.message
      });
    }
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Send bulk SMS to multiple customers
router.post('/sms/bulk', [
  authenticateToken,
  requireAuth,
  body('recipients').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('recipients.*.phone_number').notEmpty().withMessage('Phone number is required'),
  body('recipients.*.customer_name').notEmpty().withMessage('Customer name is required'),
  body('message_template').notEmpty().withMessage('Message template is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { recipients, message_template } = req.body;
    
    const twilioClient = createTwilioClient();
    if (!twilioClient) {
      return res.status(500).json({
        error: true,
        message: 'SMS service not configured'
      });
    }
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];
    
    // Send SMS to each recipient
    for (const recipient of recipients) {
      try {
        const personalizedMessage = message_template
          .replace('{customer_name}', recipient.customer_name)
          .replace('{phone_number}', recipient.phone_number);
        
        const smsResult = await twilioClient.messages.create({
          body: personalizedMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone_number
        });
        
        successCount++;
        results.push({
          phone_number: recipient.phone_number,
          customer_name: recipient.customer_name,
          status: 'success',
          messageId: smsResult.sid
        });
        
        // Log successful SMS
        const logQuery = `
          INSERT INTO communication_logs (
            type, recipient, message, status, delivered_at
          ) VALUES ('sms', ?, ?, 'delivered', NOW())
        `;
        
        db.query(logQuery, [recipient.phone_number, personalizedMessage], (err, logResult) => {
          if (err) {
            console.error('Log error:', err);
          }
        });
        
      } catch (smsError) {
        failureCount++;
        results.push({
          phone_number: recipient.phone_number,
          customer_name: recipient.customer_name,
          status: 'failed',
          error: smsError.message
        });
        
        // Log failed SMS
        const logQuery = `
          INSERT INTO communication_logs (
            type, recipient, message, status, error_message
          ) VALUES ('sms', ?, ?, 'failed', ?)
        `;
        
        db.query(logQuery, [recipient.phone_number, message_template, smsError.message], (err, logResult) => {
          if (err) {
            console.error('Log error:', err);
          }
        });
      }
    }
    
    res.json({
      error: false,
      message: `Bulk SMS completed: ${successCount} successful, ${failureCount} failed`,
      results: {
        total: recipients.length,
        successful: successCount,
        failed: failureCount,
        details: results
      }
    });
    
  } catch (error) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get communication logs
router.get('/logs', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, order_id } = req.query;
    
    // Ensure limit and offset are valid numbers
    const validLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const validOffset = Math.max(0, (parseInt(page) - 1) * validLimit);
    
    let whereClause = '';
    let params = [];
    
    if (type) {
      whereClause += 'WHERE type = ?';
      params.push(type);
    }
    
    if (status) {
      const statusWhere = whereClause ? 'AND' : 'WHERE';
      whereClause += `${statusWhere} status = ?`;
      params.push(status);
    }
    
    if (order_id) {
      const orderWhere = whereClause ? 'AND' : 'WHERE';
      whereClause += `${orderWhere} order_id = ?`;
      params.push(order_id);
    }
    
    // Check if there are any logs first
    const countQuery = `
      SELECT COUNT(*) as total
      FROM communication_logs cl
      LEFT JOIN orders o ON cl.order_id = o.id
      ${whereClause}
    `;
    
    // Use a promise to handle the count query
    const countResult = await new Promise((resolve, reject) => {
      db.query(countQuery, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    const total = countResult[0]?.total || 0;
    
    // If no logs, return empty result immediately
    if (total === 0) {
      return res.json({
        error: false,
        logs: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: validLimit
        }
      });
    }
    
    const query = `
      SELECT 
        cl.*,
        o.order_number,
        o.customer_name
      FROM communication_logs cl
      LEFT JOIN orders o ON cl.order_id = o.id
      ${whereClause}
      ORDER BY cl.sent_at DESC
      LIMIT ? OFFSET ?
    `;
    
    // Ensure we're passing numbers, not NaN
    if (isNaN(validLimit) || isNaN(validOffset)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid pagination parameters'
      });
    }
    
    // Add LIMIT and OFFSET as the last parameters
    const queryParams = [...params, validLimit, validOffset];
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: true,
          message: 'Database error occurred'
        });
      }
      
      const totalPages = Math.ceil(total / validLimit);
      
      res.json({
        error: false,
        logs: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: validLimit
        }
      });
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Email template generators
function generateOrderConfirmationEmail(order, customMessage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atlantic Leather</h1>
          <h2>Order Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${order.customer_name},</p>
          <p>Thank you for your order! We've received your order and are processing it.</p>
          ${customMessage ? `<p><strong>Note:</strong> ${customMessage}</p>` : ''}
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Items:</strong></p>
            
            ${order.items.map(item => `
              <div class="item">
                <strong>${item.product_name}</strong><br>
                Quantity: ${item.quantity} | Price: ETB ${item.unit_price}
                ${item.selected_size ? `| Size: ${item.selected_size}` : ''}
                ${item.selected_color ? `| Color: ${item.selected_color}` : ''}
              </div>
            `).join('')}
            
            <div class="total">
              <strong>Total: ETB ${order.total_amount}</strong>
            </div>
          </div>
          
          <p>We'll contact you soon to arrange payment and delivery.</p>
          <p>Best regards,<br>Atlantic Leather Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateStatusUpdateEmail(order, customMessage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .status { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atlantic Leather</h1>
          <h2>Order Status Update</h2>
        </div>
        <div class="content">
          <p>Dear ${order.customer_name},</p>
          <p>Your order status has been updated.</p>
          ${customMessage ? `<p><strong>Update:</strong> ${customMessage}</p>` : ''}
          
          <div class="status">
            <h3>Order Information</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Current Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> ETB ${order.total_amount}</p>
          </div>
          
          <p>We'll keep you updated on any further changes.</p>
          <p>Best regards,<br>Atlantic Leather Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateShippingEmail(order, customMessage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Shipped</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .shipping { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atlantic Leather</h1>
          <h2>Order Shipped!</h2>
        </div>
        <div class="content">
          <p>Dear ${order.customer_name},</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          ${customMessage ? `<p><strong>Shipping Details:</strong> ${customMessage}</p>` : ''}
          
          <div class="shipping">
            <h3>Shipping Information</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Shipping Address:</strong> ${order.customer_address}</p>
            <p><strong>Expected Delivery:</strong> 3-5 business days</p>
          </div>
          
          <p>We'll notify you when your order is delivered.</p>
          <p>Best regards,<br>Atlantic Leather Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDeliveryEmail(order, customMessage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Delivered</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .delivery { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atlantic Leather</h1>
          <h2>Order Delivered!</h2>
        </div>
        <div class="content">
          <p>Dear ${order.customer_name},</p>
          <p>Your order has been successfully delivered!</p>
          ${customMessage ? `<p><strong>Delivery Note:</strong> ${customMessage}</p>` : ''}
          
          <div class="delivery">
            <h3>Delivery Confirmation</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Delivery Address:</strong> ${order.customer_address}</p>
            <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Thank you for choosing Atlantic Leather!</p>
          <p>Best regards,<br>Atlantic Leather Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateGenericEmail(order, customMessage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .update { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atlantic Leather</h1>
          <h2>Order Update</h2>
        </div>
        <div class="content">
          <p>Dear ${order.customer_name},</p>
          <p>We have an update regarding your order.</p>
          ${customMessage ? `<p><strong>Update:</strong> ${customMessage}</p>` : ''}
          
          <div class="update">
            <h3>Order Information</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Current Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> ETB ${order.total_amount}</p>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Atlantic Leather Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Get communication logs (admin only)
router.get('/logs', [authenticateToken, requireAuth], async (req, res) => {
  try {
    // For now, return empty array since we don't have a communication_logs table yet
    // This can be extended later to track actual communication history
    res.json({
      error: false,
      data: []
    });
  } catch (error) {
    console.error('Get communication logs error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
