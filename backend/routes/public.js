const express = require('express')
const router = express.Router()
const db = require('../config/database').promise
const { sendOrderEmails } = require('../services/emailService')
const { validatePrivateKey } = require('../middleware/privateKey')

// Apply private key validation to all public routes
router.use(validatePrivateKey)

// Get all active products (public access)
router.get('/products', async (req, res) => {
  try {
    let [products] = await db.execute(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.original_price,
        p.is_on_sale,
        p.sale_price,
        p.stock_quantity,
        p.active,
        p.is_featured,
        c.name as category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1
      ORDER BY p.created_at DESC
    `)

    // Ensure products is an array
    if (!Array.isArray(products)) {
      products = []
    }

    // Get product images
    for (let product of products) {
      const [images] = await db.execute(`
        SELECT image_url FROM product_images 
        WHERE product_id = ?
        ORDER BY sort_order ASC
      `, [product.id])
      
      product.images = Array.isArray(images) ? images.map(img => img.image_url) : []
    }

    // Get product colors
    for (let product of products) {
      const [colors] = await db.execute(`
        SELECT color_name, color_code FROM product_colors 
        WHERE product_id = ? AND active = 1
        ORDER BY id ASC
      `, [product.id])
      
      product.colors = Array.isArray(colors) ? colors : []
    }

    // Get product sizes
    for (let product of products) {
      const [sizes] = await db.execute(`
        SELECT size_name FROM product_sizes 
        WHERE product_id = ? AND active = 1
        ORDER BY id ASC
      `, [product.id])
      
      product.sizes = Array.isArray(sizes) ? sizes.map(size => size.size_name) : []
    }

    // Get product features
    for (let product of products) {
      const [features] = await db.execute(`
        SELECT feature_name, feature_value FROM product_features 
        WHERE product_id = ? AND active = 1
        ORDER BY id ASC
      `, [product.id])
      
      product.features = Array.isArray(features) ? features : []
    }

    res.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    })
  }
})

// Get featured products (public access)
router.get('/featured-products', async (req, res) => {
  try {
    let [products] = await db.execute(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.original_price,
        p.is_on_sale,
        p.sale_price,
        p.stock_quantity,
        p.active,
        p.is_featured,
        c.name as category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1 AND p.is_featured = 1
      ORDER BY p.created_at DESC
      LIMIT 6
    `)

    // Ensure products is an array
    if (!Array.isArray(products)) {
      products = []
    }

    // Get product images
    for (let product of products) {
      const [images] = await db.execute(`
        SELECT image_url FROM product_images 
        WHERE product_id = ?
        ORDER BY sort_order ASC
      `, [product.id])
      
      product.images = Array.isArray(images) ? images.map(img => img.image_url) : []
    }

    // Get product colors
    for (let product of products) {
      const [colors] = await db.execute(`
        SELECT color_name, color_code FROM product_colors 
        WHERE product_id = ? AND active = 1
        ORDER BY id ASC
      `, [product.id])
      
      product.colors = Array.isArray(colors) ? colors : []
    }

    // Get product sizes
    for (let product of products) {
      const [sizes] = await db.execute(`
        SELECT size_name FROM product_sizes 
        WHERE product_id = ? AND active = 1
        ORDER BY id ASC
      `, [product.id])
      
      product.sizes = Array.isArray(sizes) ? sizes.map(size => size.size_name) : []
    }

    // Get product features
    for (let product of products) {
      const [features] = await db.execute(`
        SELECT feature_name, feature_value FROM product_features 
        WHERE product_id = ? AND active = 1
        ORDER BY id ASC
      `, [product.id])
      
      product.features = Array.isArray(features) ? features : []
    }

    res.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    })
  }
})

// Get single product by ID (public access)
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [products] = await db.execute(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.original_price,
        p.is_on_sale,
        p.sale_price,
        p.stock_quantity,
        p.active,
        c.name as category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.active = 1
    `, [id])

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const product = products[0]

    // Get product images
    const [images] = await db.execute(`
      SELECT image_url FROM product_images 
      WHERE product_id = ?
      ORDER BY sort_order ASC
    `, [id])
    
    // Transform relative image URLs to full backend URLs
    product.images = images.map(img => {
      const imageUrl = img.image_url;
      return imageUrl.startsWith('http') ? imageUrl : `http://localhost:3001${imageUrl}`;
    })

    // Get product colors
    const [colors] = await db.execute(`
      SELECT color_name, color_code FROM product_colors 
      WHERE product_id = ?
      ORDER BY id ASC
    `, [id])
    
    product.colors = colors

    // Get product sizes
    const [sizes] = await db.execute(`
      SELECT size_name FROM product_sizes 
      WHERE product_id = ?
      ORDER BY id ASC
    `, [id])
    
    product.sizes = sizes.map(size => size.size_name)

    // Get product features
    const [features] = await db.execute(`
      SELECT feature_name, feature_value FROM product_features 
      WHERE product_id = ?
      ORDER BY id ASC
    `, [id])
    
    product.features = features

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    })
  }
})

// Get all active categories (public access)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT id, name, description, image_url
      FROM categories 
      WHERE active = 1
      ORDER BY sort_order ASC, name ASC
    `)

    // Ensure categories is an array
    if (!Array.isArray(categories)) {
      categories = []
    }

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    })
  }
})

// Submit customer order (public access)
router.post('/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      notes
    } = req.body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      })
    }

    // Start transaction
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      // Create order
      const [orderResult] = await connection.execute(`
        INSERT INTO orders (
          customer_name, 
          customer_email, 
          customer_phone, 
          total_amount, 
          notes, 
          status, 
          payment_status
        ) VALUES (?, ?, ?, ?, ?, 'Pending', 'Pending')
      `, [customerName, customerEmail, customerPhone, totalAmount, notes])

      const orderId = orderResult.insertId

      // Create order items with complete product information
      for (const item of items) {
        let productInfo = {
          product_name: item.product_name || 'Unknown Product',
          product_image: item.product_image || '/placeholder-product.jpg',
          category_name: item.product_category || 'General',
          original_price: item.original_price || null
        }

        // If we don't have complete product info, fetch it from database
        if (!item.product_name || !item.product_image) {
          const [productResult] = await connection.execute(`
            SELECT 
              p.title as product_name,
              p.original_price,
              c.name as category_name,
              COALESCE(pi.image_url, '/placeholder-product.jpg') as product_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE p.id = ?
          `, [item.productId])

          if (productResult.length > 0) {
            productInfo = {
              product_name: productResult[0].product_name,
              product_image: productResult[0].product_image,
              category_name: productResult[0].category_name,
              original_price: productResult[0].original_price
            }
          }
        }

        await connection.execute(`
          INSERT INTO order_items (
            order_id, 
            product_id, 
            product_name,
            product_image,
            product_category,
            quantity, 
            price, 
            original_price,
            size, 
            color
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          item.productId,
          productInfo.product_name,
          productInfo.product_image,
          productInfo.category_name,
          item.quantity,
          item.price,
          productInfo.original_price,
          item.size || null,
          item.color || null
        ])

        // Update product stock
        await connection.execute(`
          UPDATE products 
          SET stock_quantity = stock_quantity - ? 
          WHERE id = ?
        `, [item.quantity, item.productId])
      }

      // Commit transaction
      await connection.commit()

      // Prepare order data for emails
      const orderData = {
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        items,
        totalAmount,
        notes
      }

      // Send confirmation emails (don't wait for completion)
      sendOrderEmails(orderData).then(result => {
        if (result.customerEmail.success) {
          console.log(`Order confirmation email sent to customer: ${customerEmail}`)
        } else {
          console.error('Failed to send customer confirmation email:', result.customerEmail.error)
        }
        
        if (result.adminEmail.success) {
          console.log('Admin notification email sent successfully')
        } else {
          console.error('Failed to send admin notification email:', result.adminEmail.error)
        }
      }).catch(error => {
        console.error('Error sending order emails:', error)
      })

      res.status(201).json({
        success: true,
        message: 'Order submitted successfully',
        data: { orderId }
      })

    } catch (error) {
      // Rollback on error
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('Error submitting order:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit order'
    })
  }
})

module.exports = router
