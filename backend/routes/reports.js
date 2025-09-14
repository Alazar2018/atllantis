const express = require('express');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const db = require('../config/database').promise;

const router = express.Router();

// Get dashboard reports (admin only)
router.get('/', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const adminUserId = req.user.id;
    
    // Get total products
    const [productsResult] = await db.execute(
      'SELECT COUNT(*) as total FROM products WHERE active = TRUE'
    );
    const totalProducts = productsResult[0].total;
    
    // Get total orders
    const [ordersResult] = await db.execute(
      'SELECT COUNT(*) as total FROM orders'
    );
    const totalOrders = ordersResult[0].total;
    
    // Get total customers (unique customers who have placed orders)
    const [customersResult] = await db.execute(
      'SELECT COUNT(DISTINCT customer_email) as total FROM orders'
    );
    const totalCustomers = customersResult[0].total;
    
    // Get total sales (confirmed and sold orders only)
    const [salesResult] = await db.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status IN ("Confirmed", "Sold")'
    );
    const totalSales = parseFloat(salesResult[0].total) || 0;
    
    // Get admin balance
    const [balanceResult] = await db.execute(
      'SELECT current_balance, total_earned, total_withdrawn FROM admin_balance WHERE user_id = ?',
      [adminUserId]
    );
    
    let currentBalance = 0;
    let totalEarned = 0;
    let totalWithdrawn = 0;
    
    if (balanceResult.length > 0) {
      currentBalance = parseFloat(balanceResult[0].current_balance) || 0;
      totalEarned = parseFloat(balanceResult[0].total_earned) || 0;
      totalWithdrawn = parseFloat(balanceResult[0].total_withdrawn) || 0;
    } else {
      // Create default balance record if it doesn't exist
      await db.execute(
        'INSERT INTO admin_balance (user_id, current_balance, total_earned, total_withdrawn) VALUES (?, ?, ?, ?)',
        [adminUserId, 0, 0, 0]
      );
      console.log('Created default balance record for user:', adminUserId);
    }
    
    // Get monthly sales for current year
    const currentYear = new Date().getFullYear();
    const [monthlySalesResult] = await db.execute(`
      SELECT 
        MONTHNAME(created_at) as month,
        COALESCE(SUM(total_amount), 0) as amount
      FROM orders 
      WHERE status IN ("Confirmed", "Sold") 
        AND YEAR(created_at) = ?
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY MONTH(created_at)
    `, [currentYear]);
    
    // Get top selling products
    const [topProductsResult] = await db.execute(`
      SELECT 
        p.title as name,
        COUNT(oi.id) as sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ("Confirmed", "Sold")
      GROUP BY p.id, p.title
      ORDER BY sales DESC
      LIMIT 5
    `);
    
    // Get recent orders
    const [recentOrdersResult] = await db.execute(`
      SELECT 
        o.id,
        o.customer_name as customer,
        o.total_amount as amount,
        o.created_at as date,
        o.status
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    // Get low stock products (less than 10 items)
    const [lowStockResult] = await db.execute(`
      SELECT 
        id,
        title,
        stock_quantity,
        price
      FROM products 
      WHERE active = TRUE AND stock_quantity < 10
      ORDER BY stock_quantity ASC
      LIMIT 5
    `);
    
    // Get pending orders count
    const [pendingOrdersResult] = await db.execute(
      'SELECT COUNT(*) as total FROM orders WHERE status = "pending"'
    );
    const pendingOrders = pendingOrdersResult[0].total;
    
    // Get confirmed orders count (ready to be marked as sold)
    const [confirmedOrdersResult] = await db.execute(
      'SELECT COUNT(*) as total FROM orders WHERE status = "Confirmed"'
    );
    const confirmedOrders = confirmedOrdersResult[0].total;
    
    // Get sold orders count
    const [soldOrdersResult] = await db.execute(
      'SELECT COUNT(*) as total FROM orders WHERE status = "Sold"'
    );
    const soldOrders = soldOrdersResult[0].total;
    
    // Get recent transactions
    let transactionsResult = [];
    try {
      const [transactionsData] = await db.execute(`
        SELECT 
          t.type,
          t.amount,
          t.description,
          t.created_at,
          o.id as order_id
        FROM transactions t
        LEFT JOIN orders o ON t.order_id = o.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
        LIMIT 10
      `, [adminUserId]);
      transactionsResult = transactionsData;
    } catch (error) {
      console.log('No transactions table yet or error:', error.message);
      transactionsResult = [];
    }
    
    res.json({
      error: false,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSales,
        currentBalance,
        totalEarned,
        totalWithdrawn,
        pendingOrders,
        confirmedOrders,
        soldOrders,
        monthlySales: monthlySalesResult.map(row => ({
          month: row.month,
          amount: parseFloat(row.amount)
        })),
        topProducts: topProductsResult.map(row => ({
          name: row.name,
          sales: parseInt(row.sales)
        })),
        recentOrders: recentOrdersResult.map(row => ({
          id: row.id,
          customer: row.customer,
          amount: parseFloat(row.amount),
          date: row.date,
          status: row.status
        })),
        lowStockProducts: lowStockResult.map(row => ({
          id: row.id,
          title: row.title,
          stock_quantity: row.stock_quantity,
          price: parseFloat(row.price)
        })),
        recentTransactions: transactionsResult.map(row => ({
          type: row.type,
          amount: parseFloat(row.amount),
          description: row.description,
          date: row.created_at,
          orderId: row.order_id
        }))
      }
    });
    
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
