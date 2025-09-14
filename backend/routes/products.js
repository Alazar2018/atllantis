const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const db = require('../config/database').promise;

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort = 'created_at', order = 'DESC' } = req.query;
    
    console.log('Debug - Raw query params:', req.query);
    console.log('Debug - Parsed values:', { category, search, sort, order });
    
    // Validate and sanitize sort parameter
    const allowedSortFields = ['created_at', 'updated_at', 'title', 'price', 'stock_quantity'];
    const allowedOrders = ['ASC', 'DESC'];
    
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    
    let whereClause = 'WHERE p.active = 1';
    let params = [];
    
    if (category) {
      whereClause += ' AND c.slug = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Build the ORDER BY clause safely
    let orderByClause = 'ORDER BY ';
    if (sortField === 'created_at') {
      orderByClause += 'p.created_at';
    } else if (sortField === 'updated_at') {
      orderByClause += 'p.updated_at';
    } else if (sortField === 'title') {
      orderByClause += 'p.title';
    } else if (sortField === 'price') {
      orderByClause += 'p.price';
    } else if (sortField === 'stock_quantity') {
      orderByClause += 'p.stock_quantity';
    } else {
      orderByClause += 'p.created_at'; // default fallback
    }
    orderByClause += ` ${sortOrder}`;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderByClause}
    `;
    
    console.log('Debug - Original params:', params);
    console.log('Debug - SQL query:', query);
    console.log('Debug - Parameter types:', params.map(p => typeof p));
    
    const [results] = await db.execute(query, params);
    
    res.json({
      error: false,
      products: results,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: results.length,
        itemsPerPage: results.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get all products (admin - without active restriction)
router.get('/admin', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { category, search, sort = 'created_at', order = 'DESC' } = req.query;
    
    console.log('Debug - Admin route - Raw query params:', req.query);
    console.log('Debug - Admin route - Parsed values:', { category, search, sort, order });
    
    // Validate and sanitize sort parameter
    const allowedSortFields = ['created_at', 'updated_at', 'title', 'price', 'stock_quantity'];
    const allowedOrders = ['ASC', 'DESC'];
    
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    
    let whereClause = 'WHERE 1=1'; // No active restriction for admin
    let params = [];
    
    if (category) {
      whereClause += ' AND c.slug = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Build the ORDER BY clause safely
    let orderByClause = 'ORDER BY ';
    if (sortField === 'created_at') {
      orderByClause += 'p.created_at';
    } else if (sortField === 'updated_at') {
      orderByClause += 'p.updated_at';
    } else if (sortField === 'title') {
      orderByClause += 'p.title';
    } else if (sortField === 'price') {
      orderByClause += 'p.price';
    } else if (sortField === 'stock_quantity') {
      orderByClause += 'p.stock_quantity';
    } else {
      orderByClause += 'p.created_at'; // default fallback
    }
    orderByClause += ` ${sortOrder}`;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderByClause}
    `;
    
    console.log('Debug - Admin route - Original params:', params);
    console.log('Debug - Admin route - SQL query:', query);
    console.log('Debug - Admin route - Parameter types:', params.map(p => typeof p));
    
    const [results] = await db.execute(query, params);
    
    res.json({
      error: false,
      products: results,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: results.length,
        itemsPerPage: results.length
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get single product by ID (admin - without active restriction)
router.get('/admin/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    
    const [results] = await db.execute(query, [productId]);
    
    if (results.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }
    
    const product = results[0];
    
    // Get product images
    const imagesQuery = 'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC';
    const [images] = await db.execute(imagesQuery, [productId]);
    
    // Get product colors
    const colorsQuery = 'SELECT * FROM product_colors WHERE product_id = ? AND active = 1';
    const [colors] = await db.execute(colorsQuery, [productId]);
    
    // Get product sizes
    const sizesQuery = 'SELECT * FROM product_sizes WHERE product_id = ? AND active = 1';
    const [sizes] = await db.execute(sizesQuery, [productId]);
    
    // Get product features
    const featuresQuery = 'SELECT * FROM product_features WHERE product_id = ? AND active = 1';
    const [features] = await db.execute(featuresQuery, [productId]);
    
    product.images = images || [];
    product.colors = colors || [];
    product.sizes = sizes || [];
    product.features = features || [];
    
    res.json({
      error: false,
      product
    });
  } catch (error) {
    console.error('Get admin product error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.active = 1
    `;
    
    const [results] = await db.execute(query, [productId]);
    
    if (results.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }
    
    const product = results[0];
    
    // Get product images
    const imagesQuery = 'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC';
    const [images] = await db.execute(imagesQuery, [productId]);
    
    // Get product colors
    const colorsQuery = 'SELECT * FROM product_colors WHERE product_id = ? AND active = 1';
    const [colors] = await db.execute(colorsQuery, [productId]);
    
    // Get product sizes
    const sizesQuery = 'SELECT * FROM product_sizes WHERE product_id = ? AND active = 1';
    const [sizes] = await db.execute(sizesQuery, [productId]);
    
    // Get product features
    const featuresQuery = 'SELECT * FROM product_features WHERE product_id = ? AND active = 1';
    const [features] = await db.execute(featuresQuery, [productId]);
    
    product.images = images || [];
    product.colors = colors || [];
    product.sizes = sizes || [];
    product.features = features || [];
    
    res.json({
      error: false,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Create new product (admin only)
router.post('/', [
  authenticateToken,
  requireAuth,
  upload.array('images', 10), // Allow up to 10 images
  body('title').notEmpty().withMessage('Product title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category_id').isInt().withMessage('Valid category ID is required'),
  body('description').notEmpty().withMessage('Product description is required')
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
    
    const {
      title, description, price, original_price, category_id, stock_quantity, is_on_sale, sale_price,
      colors, sizes, features, active, is_featured, primary_image_index
    } = req.body;
    
    // Parse arrays safely - handle both FormData strings and JSON
    let colorsArray = [];
    let sizesArray = [];
    let featuresArray = [];
    
    try {
      if (colors) {
        if (typeof colors === 'string') {
          // Try to parse as JSON first
          try {
            colorsArray = JSON.parse(colors);
          } catch (e) {
            // If not JSON, treat as comma-separated string
            colorsArray = colors.split(',').map(c => c.trim()).filter(c => c);
          }
        } else if (Array.isArray(colors)) {
          colorsArray = colors;
        }
      }
    } catch (e) {
      console.log('Warning: Invalid colors data, using empty array');
      colorsArray = [];
    }
    
    try {
      if (sizes) {
        if (typeof sizes === 'string') {
          try {
            sizesArray = JSON.parse(sizes);
          } catch (e) {
            sizesArray = sizes.split(',').map(s => s.trim()).filter(s => s);
          }
        } else if (Array.isArray(sizes)) {
          sizesArray = sizes;
        }
      }
    } catch (e) {
      console.log('Warning: Invalid sizes data, using empty array');
      sizesArray = [];
    }
    
    try {
      if (features) {
        if (typeof features === 'string') {
          try {
            featuresArray = JSON.parse(features);
          } catch (e) {
            featuresArray = features.split(',').map(f => f.trim()).filter(f => f);
          }
        } else if (Array.isArray(features)) {
          featuresArray = features;
        }
      }
    } catch (e) {
      console.log('Warning: Invalid features data, using empty array');
      featuresArray = [];
    }
    
    // Convert boolean strings to integers for MySQL
    const isOnSale = is_on_sale === 'true' || is_on_sale === true ? 1 : 0;
    const isActive = active === 'true' || active === true ? 1 : 0;
    const isFeatured = is_featured === 'true' || is_featured === true ? 1 : 0;
    
    const query = `
      INSERT INTO products (
        title, description, price, original_price, sale_price, category_id, stock_quantity, is_on_sale, active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      title, description, price, original_price, sale_price, category_id, stock_quantity, isOnSale, isActive, isFeatured
    ];
    
    const [result] = await db.execute(query, params);
    const productId = result.insertId;
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageQuery = `
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, ?, ?)
      `;
      
      // Parse primary image index, default to 0 if not provided
      const primaryIndex = parseInt(primary_image_index) || 0;
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = i === primaryIndex; // Use provided primary index
        
        await db.execute(imageQuery, [productId, imageUrl, isPrimary, i]);
      }
    }
    
    // Handle colors
    if (colorsArray.length > 0) {
      const colorQuery = `
        INSERT INTO product_colors (product_id, color_name, active)
        VALUES (?, ?, TRUE)
      `;
      
      for (const color of colorsArray) {
        await db.execute(colorQuery, [productId, color]);
      }
    }
    
    // Handle sizes
    if (sizesArray.length > 0) {
      const sizeQuery = `
        INSERT INTO product_sizes (product_id, size_name, active)
        VALUES (?, ?, TRUE)
      `;
      
      for (const size of sizesArray) {
        await db.execute(sizeQuery, [productId, size]);
      }
    }
    
    // Handle features
    if (featuresArray.length > 0) {
      const featureQuery = `
        INSERT INTO product_features (product_id, feature_name, active)
        VALUES (?, ?, TRUE)
      `;
      
      for (const feature of featuresArray) {
        await db.execute(featureQuery, [productId, feature]);
      }
    }
    
    res.status(201).json({
      error: false,
      message: 'Product created successfully',
      productId: productId
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = 'Invalid category ID - category does not exist';
    } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      errorMessage = 'Invalid data type for one or more fields';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = 'Invalid field in request';
    } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      errorMessage = 'Invalid data type for one or more fields';
    }
    
    res.status(500).json({
      error: true,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update product (admin only)
router.put('/:id', [
  authenticateToken,
  requireAuth,
  upload.array('images', 10), // Allow up to 10 images
], async (req, res) => {
  try {
    console.log('PUT /:id - Request body:', req.body);
    console.log('PUT /:id - Files:', req.files);
    console.log('PUT /:id - Content-Type:', req.headers['content-type']);
    
    // For multipart requests, body fields are available directly
    const {
      title, description, price, original_price, category_id, stock_quantity, is_on_sale, sale_price, is_featured, primary_image_index
    } = req.body;
    
    // Validate required fields
    if (!title || !price) {
      return res.status(400).json({
        error: true,
        message: 'Product title and price are required'
      });
    }
    
    const productId = req.params.id;
    
    // Convert boolean strings to integers for MySQL
    const isOnSale = is_on_sale === 'true' || is_on_sale === true ? 1 : 0;
    const isFeatured = is_featured === 'true' || is_featured === true ? 1 : 0;
    
    const query = `
      UPDATE products SET
        title = ?, description = ?, price = ?, original_price = ?, 
        category_id = ?, stock_quantity = ?, is_on_sale = ?, is_featured = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      title, description, price, original_price, category_id, stock_quantity, isOnSale, isFeatured, productId
    ];
    
    const [result] = await db.execute(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }

    // Handle image uploads if new images are provided
    if (req.files && req.files.length > 0) {
      // Parse primary image index, default to 0 if not provided
      const primaryIndex = parseInt(primary_image_index) || 0;
      
      // Insert new images
      const imageQuery = `
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, ?, ?)
      `;
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = i === primaryIndex; // Use provided primary index
        
        await db.execute(imageQuery, [productId, imageUrl, isPrimary, i]);
      }
    }
    
    res.json({
      error: false,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Update product primary image (admin only)
router.patch('/:id/primary-image', [
  authenticateToken,
  requireAuth,
  body('image_id').isInt().withMessage('Valid image ID is required')
], async (req, res) => {
  try {
    const productId = req.params.id;
    const { image_id } = req.body;
    
    // First, set all images for this product as non-primary
    await db.execute(
      'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
      [productId]
    );
    
    // Then set the specified image as primary
    const [result] = await db.execute(
      'UPDATE product_images SET is_primary = TRUE WHERE id = ? AND product_id = ?',
      [image_id, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Image not found or does not belong to this product'
      });
    }
    
    res.json({
      error: false,
      message: 'Primary image updated successfully'
    });
  } catch (error) {
    console.error('Update primary image error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Delete product image (admin only)
router.delete('/:id/images/:imageId', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const productId = req.params.id;
    const imageId = req.params.imageId;
    
    // Check if this is the primary image
    const [imageCheck] = await db.execute(
      'SELECT is_primary FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );
    
    if (imageCheck.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Image not found or does not belong to this product'
      });
    }
    
    const isPrimary = imageCheck[0].is_primary;
    
    // Delete the image
    const [result] = await db.execute(
      'DELETE FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Image not found or does not belong to this product'
      });
    }
    
    // If this was the primary image, set the first remaining image as primary
    if (isPrimary) {
      const [remainingImages] = await db.execute(
        'SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1',
        [productId]
      );
      
      if (remainingImages.length > 0) {
        await db.execute(
          'UPDATE product_images SET is_primary = TRUE WHERE id = ?',
          [remainingImages[0].id]
        );
      }
    }
    
    res.json({
      error: false,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Delete product (admin only)
router.delete('/:id', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Soft delete - set active to false
    const query = 'UPDATE products SET active = FALSE WHERE id = ?';
    
    const [result] = await db.execute(query, [productId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }
    
    res.json({
      error: false,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
