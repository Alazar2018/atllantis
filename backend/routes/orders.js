const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const db = require('../config/database').promise;

const router = express.Router();

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ATL-${timestamp.slice(-6)}-${random}`;
};

// Get all orders (admin only)
router.get('/', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sort = 'created_at', order = 'DESC' } = req.query;
    
    // Ensure limit and offset are valid numbers
    const validLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const validOffset = Math.max(0, (parseInt(page) - 1) * validLimit);
    
    // Validate and sanitize sort parameter
    const allowedSortFields = ['created_at', 'updated_at', 'customer_name', 'customer_email', 'order_number', 'total_amount', 'status'];
    const allowedOrders = ['ASC', 'DESC'];
    
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    
    let whereClause = '';
    let params = [];
    
    if (status) {
      whereClause += 'WHERE o.status = ?';
      params.push(status);
    }
    
    if (search) {
      const searchWhere = whereClause ? 'AND' : 'WHERE';
      whereClause += `${searchWhere} (o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.order_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Check if there are any orders first
    const countQuery = `
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
    `;
    
    const [countResult] = await db.execute(countQuery, params);
    const total = countResult[0]?.total || 0;
    
    // If no orders, return empty result immediately
    if (total === 0) {
      return res.json({
        error: false,
        data: [],
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
        o.*,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      ${whereClause}
      ORDER BY o.${sortField} ${sortOrder}
      LIMIT ${parseInt(validLimit)} OFFSET ${parseInt(validOffset)}
    `;
    
    console.log('🔍 Orders query params:', params);
    console.log('🔍 Orders query:', query);
    
    const [results] = await db.execute(query, params);
    
    const totalPages = Math.ceil(total / validLimit);
    
    res.json({
      error: false,
      data: results,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: validLimit
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get single order by ID (admin only)
router.get('/:id', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get order details
    const orderQuery = 'SELECT * FROM orders WHERE id = ?';
    
    const [orderResults] = await db.execute(orderQuery, [orderId]);
    
    if (orderResults.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Order not found'
      });
    }
    
    const order = orderResults[0];
    
    // Get order items with product details
    const itemsQuery = `
      SELECT 
        oi.*,
        p.title as product_name,
        p.description as product_description,
        p.price as original_price,
        c.name as product_category,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = ?
    `;
    
    const [items] = await db.execute(itemsQuery, [orderId]);
    
    order.items = items || [];
    
    res.json({
      error: false,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Create new order (public - from frontend cart)
router.post('/', [
  body('customer_name').notEmpty().withMessage('Customer name is required'),
  body('customer_email').isEmail().withMessage('Valid email is required'),
  body('customer_phone').notEmpty().withMessage('Customer phone is required'),
  body('customer_address').notEmpty().withMessage('Customer address is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isInt().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Valid unit price is required')
], (req, res) => {
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
    
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      notes
    } = req.body;
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Start transaction
    db.beginTransaction(async (err) => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).json({
          error: true,
          message: 'Failed to start transaction'
        });
      }
      
      try {
        // Insert order
        const orderQuery = `
          INSERT INTO orders (
            order_number, customer_name, customer_email, customer_phone,
            customer_address, total_amount, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const orderParams = [
          orderNumber, customer_name, customer_email, customer_phone,
          customer_address, totalAmount, notes
        ];
        
        db.query(orderQuery, orderParams, (err, orderResult) => {
          if (err) {
            console.error('Order insert error:', err);
            return db.rollback(() => {
              res.status(500).json({
                error: true,
                message: 'Failed to create order'
              });
            });
          }
          
          const orderId = orderResult.insertId;
          
          // Insert order items
          const itemQuery = `
            INSERT INTO order_items (
              order_id, product_id, product_name, product_sku, quantity,
              unit_price, total_price, selected_size, selected_color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          let itemsInserted = 0;
          const itemErrors = [];
          
          items.forEach((item) => {
            const itemParams = [
              orderId,
              item.product_id,
              item.product_name,
              item.product_sku,
              item.quantity,
              item.unit_price,
              item.unit_price * item.quantity,
              item.selected_size,
              item.selected_color
            ];
            
            db.query(itemQuery, itemParams, (err, itemResult) => {
              if (err) {
                console.error('Item insert error:', err);
                itemErrors.push(`Failed to save item: ${item.product_name}`);
              } else {
                itemsInserted++;
              }
              
              // Check if all items have been processed
              if (itemsInserted + itemErrors.length === items.length) {
                if (itemErrors.length > 0) {
                  // Rollback if there were errors
                  db.rollback(() => {
                    res.status(500).json({
                      error: true,
                      message: `Failed to create order: ${itemErrors.join(', ')}`
                    });
                  });
                } else {
                  // Commit transaction
                  db.commit(async (err) => {
                    if (err) {
                      console.error('Commit error:', err);
                      return db.rollback(() => {
                        res.status(500).json({
                          error: true,
                          message: 'Failed to commit order'
                        });
                      });
                    }
                    
                    // Send webhook notification for new order
                    try {
                      const webhookService = require('../services/webhookService');
                      const orderData = {
                        id: orderId,
                        order_number: orderNumber,
                        customer_name,
                        customer_email,
                        customer_phone,
                        customer_address,
                        total_amount: totalAmount,
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        items: items.map(item => ({
                          product_name: item.product_name,
                          quantity: item.quantity,
                          price: item.unit_price,
                          size: item.selected_size,
                          color: item.selected_color
                        })),
                        notes
                      };
                      
                      await webhookService.sendOrderWebhook(orderData);
                      console.log('✅ Order webhook sent successfully');
                    } catch (webhookError) {
                      console.error('❌ Webhook error (non-blocking):', webhookError.message);
                    }
                    
                    res.status(201).json({
                      error: false,
                      message: 'Order created successfully',
                      orderId,
                      orderNumber,
                      totalAmount
                    });
                  });
                }
              }
            });
          });
        });
      } catch (error) {
        console.error('Order creation error:', error);
        db.rollback(() => {
          res.status(500).json({
            error: true,
            message: 'Internal server error'
          });
        });
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', [
  authenticateToken,
  requireAuth,
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required'),
  body('admin_notes').optional().isString().withMessage('Admin notes must be a string')
], (req, res) => {
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
    
    const orderId = req.params.id;
    const { status, admin_notes } = req.body;
    
    const query = 'UPDATE orders SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.query(query, [status, admin_notes, orderId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: true,
          message: 'Failed to update order status'
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: true,
          message: 'Order not found'
        });
      }
      
      res.json({
        error: false,
        message: 'Order status updated successfully',
        status
      });
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Update order payment status (admin only)
router.put('/:id/payment', [
  authenticateToken,
  requireAuth,
  body('payment_status').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Valid payment status is required'),
  body('payment_method').optional().isString().withMessage('Payment method must be a string')
], (req, res) => {
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
    
    const orderId = req.params.id;
    const { payment_status, payment_method } = req.body;
    
    const query = 'UPDATE orders SET payment_status = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.query(query, [payment_status, payment_method, orderId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: true,
          message: 'Failed to update payment status'
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: true,
          message: 'Order not found'
        });
      }
      
      res.json({
        error: false,
        message: 'Payment status updated successfully',
        payment_status
      });
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', [authenticateToken, requireAuth], (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: true,
          message: 'Database error occurred'
        });
      }
      
      const stats = results[0];
      
      // Get recent orders
      const recentQuery = `
        SELECT order_number, customer_name, total_amount, status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      db.query(recentQuery, (err, recentOrders) => {
        if (err) {
          console.error('Recent orders error:', err);
        }
        
        res.json({
          error: false,
          stats: {
            ...stats,
            total_revenue: parseFloat(stats.total_revenue || 0).toFixed(2),
            average_order_value: parseFloat(stats.average_order_value || 0).toFixed(2)
          },
          recentOrders: recentOrders || []
        });
      });
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Search orders (admin only)
router.get('/search/customers', [authenticateToken, requireAuth], (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        error: true,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const query = `
      SELECT DISTINCT
        customer_name,
        customer_email,
        customer_phone,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spent,
        MAX(created_at) as last_order
      FROM orders
      WHERE 
        customer_name LIKE ? OR 
        customer_email LIKE ? OR 
        customer_phone LIKE ? OR
        order_number LIKE ?
      GROUP BY customer_email
      ORDER BY last_order DESC
      LIMIT 20
    `;
    
    const searchTerm = `%${q}%`;
    
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: true,
          message: 'Database error occurred'
        });
      }
      
      res.json({
        error: false,
        customers: results
      });
    });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Confirm order (admin only) - update status, decrease stock, send email
router.post('/:id/confirm', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Start a database transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get order details
      const [orderResults] = await connection.execute(
        'SELECT * FROM orders WHERE id = ? AND status = "Pending"',
        [orderId]
      );
      
      if (orderResults.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          error: true,
          message: 'Order not found or already confirmed'
        });
      }
      
      const order = orderResults[0];
      
      // Get order items
      const [itemsResults] = await connection.execute(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
      
      if (itemsResults.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          error: true,
          message: 'Order has no items'
        });
      }
      
      // Check stock availability and decrease stock
      for (const item of itemsResults) {
        const [productResults] = await connection.execute(
          'SELECT stock_quantity FROM products WHERE id = ?',
          [item.product_id]
        );
        
        if (productResults.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            error: true,
            message: `Product with ID ${item.product_id} not found`
          });
        }
        
        const currentStock = productResults[0].stock_quantity;
        if (currentStock < item.quantity) {
          await connection.rollback();
          return res.status(400).json({
            error: true,
            message: `Insufficient stock for product ${item.product_name}. Available: ${currentStock}, Requested: ${item.quantity}`
          });
        }
        
        // Decrease stock
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      // Update order status
      await connection.execute(
        'UPDATE orders SET status = "Confirmed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [orderId]
      );
      
      // Commit transaction
      await connection.commit();
      
      // Send confirmation email
      try {
        const emailService = require('../services/emailService');
        await emailService.sendOrderConfirmationEmail(order, itemsResults);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the order confirmation if email fails
      }
      
      res.json({
        error: false,
        message: 'Order confirmed successfully',
        data: {
          orderId: orderId,
          status: 'Confirmed'
        }
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Mark order as sold (admin only) - add money to balance, update status
router.post('/:id/mark-sold', [authenticateToken, requireAuth], async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const orderId = req.params.id;
    
    // Get order details
    const [orderResults] = await connection.execute(
      'SELECT * FROM orders WHERE id = ? AND status = "Confirmed"',
      [orderId]
    );
    
    if (orderResults.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: true,
        message: 'Order not found or not confirmed'
      });
    }
    
    const order = orderResults[0];
    
    // Get admin user ID from token
    const adminUserId = req.user.id;
    
    // Get current balance
    const [balanceResults] = await connection.execute(
      'SELECT * FROM admin_balance WHERE user_id = ?',
      [adminUserId]
    );
    
    let currentBalance = 0;
    let balanceId = null;
    
    if (balanceResults.length === 0) {
      // Create balance record if it doesn't exist
      const [insertResult] = await connection.execute(
        'INSERT INTO admin_balance (user_id, current_balance, total_earned) VALUES (?, ?, ?)',
        [adminUserId, order.total_amount, order.total_amount]
      );
      balanceId = insertResult.insertId;
      currentBalance = order.total_amount;
    } else {
      balanceId = balanceResults[0].id;
      currentBalance = parseFloat(balanceResults[0].current_balance);
    }
    
    const newBalance = currentBalance + parseFloat(order.total_amount);
    
    // Update balance
    await connection.execute(
      'UPDATE admin_balance SET current_balance = ?, total_earned = total_earned + ? WHERE id = ?',
      [newBalance, order.total_amount, balanceId]
    );
    
    // Record transaction
    await connection.execute(
      'INSERT INTO transactions (user_id, order_id, type, amount, description, balance_before, balance_after) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        adminUserId,
        orderId,
        'sale',
        order.total_amount,
        `Sale from order ${order.order_number}`,
        currentBalance,
        newBalance
      ]
    );
    
    // Update order status to sold
    await connection.execute(
      'UPDATE orders SET status = "Sold", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [orderId]
    );
    
    // Commit transaction
    await connection.commit();
    
    res.json({
      error: false,
      message: 'Order marked as sold successfully',
      data: {
        orderId: orderId,
        status: 'Sold',
        amountAdded: order.total_amount,
        newBalance: newBalance
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Mark as sold error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
