const express = require('express');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const db = require('../config/database').promise;

const router = express.Router();

// Get all customers with their order statistics (admin only)
router.get('/', [authenticateToken, requireAuth], async (req, res) => {
  try {
    // Get customers with their order statistics
    const [customersResult] = await db.execute(`
      SELECT 
        o.customer_email as email,
        o.customer_name as name,
        o.customer_phone as phone,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status IN ('Confirmed', 'Sold') THEN o.total_amount ELSE 0 END), 0) as total_spent,
        MAX(o.created_at) as last_order_date,
        MIN(o.created_at) as created_at
      FROM orders o
      GROUP BY o.customer_email, o.customer_name, o.customer_phone
      ORDER BY total_spent DESC, total_orders DESC
    `);

    console.log(`Found ${customersResult.length} customers in database`);

    // Transform the data to match frontend expectations
    const customers = customersResult.map((row, index) => ({
      id: index + 1, // Generate sequential ID since we don't have customer IDs
      name: row.name || 'Unknown',
      email: row.email || 'No email',
      phone: row.phone || 'No phone',
      total_orders: parseInt(row.total_orders) || 0,
      total_spent: parseFloat(row.total_spent) || 0,
      last_order_date: row.last_order_date ? new Date(row.last_order_date).toISOString().split('T')[0] : 'Never',
      created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : 'Unknown'
    }));

    // If no customers found, return empty array instead of error
    if (customers.length === 0) {
      console.log('No customers found in database');
    }

    res.json({
      error: false,
      data: customers
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get customer details by email (admin only)
router.get('/:email', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const customerEmail = req.params.email;

    // Get customer details
    const [customerResult] = await db.execute(`
      SELECT 
        o.customer_email as email,
        o.customer_name as name,
        o.customer_phone as phone,
        o.customer_address as address,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status IN ('Confirmed', 'Sold') THEN o.total_amount ELSE 0 END), 0) as total_spent,
        MAX(o.created_at) as last_order_date,
        MIN(o.created_at) as created_at
      FROM orders o
      WHERE o.customer_email = ?
      GROUP BY o.customer_email, o.customer_name, o.customer_phone, o.customer_address
    `, [customerEmail]);

    if (customerResult.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Customer not found'
      });
    }

    const customer = customerResult[0];

    // Get customer's order history
    const [ordersResult] = await db.execute(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        o.notes
      FROM orders o
      WHERE o.customer_email = ?
      ORDER BY o.created_at DESC
    `, [customerEmail]);

    // Transform the data
    const customerData = {
      id: 1, // Generate ID since we don't have customer IDs
      name: customer.name || 'Unknown',
      email: customer.email || 'No email',
      phone: customer.phone || 'No phone',
      address: customer.address || 'No address',
      total_orders: parseInt(customer.total_orders) || 0,
      total_spent: parseFloat(customer.total_spent) || 0,
      last_order_date: customer.last_order_date ? new Date(customer.last_order_date).toISOString().split('T')[0] : 'Never',
      created_at: customer.created_at ? new Date(customer.created_at).toISOString().split('T')[0] : 'Unknown',
      orders: ordersResult.map(order => ({
        id: order.id,
        total_amount: parseFloat(order.total_amount) || 0,
        status: order.status,
        created_at: new Date(order.created_at).toISOString().split('T')[0],
        notes: order.notes || ''
      }))
    };

    res.json({
      error: false,
      data: customerData
    });

  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
