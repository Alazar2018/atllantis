const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const db = require('../config/database').promise;

const router = express.Router();

// Configure multer for category image uploads
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
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let whereClause = '';
    let params = [];
    
    if (active === 'true') {
      whereClause = 'WHERE active = 1';
    }
    
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    
    const [results] = await db.execute(query, params);
    
    res.json({
      error: false,
      categories: results
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get single category by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
      WHERE c.id = ?
      GROUP BY c.id
    `;
    
    const [results] = await db.execute(query, [categoryId]);
    
    if (results.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Category not found'
      });
    }
    
    res.json({
      error: false,
      category: results[0]
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Create new category (admin only)
router.post('/', [
  authenticateToken,
  requireAuth,
  upload.single('image'), // Handle single image upload
  body('name').notEmpty().withMessage('Category name is required'),
  body('slug').notEmpty().withMessage('Category slug is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { name, slug, description, sort_order = 0 } = req.body;
    
    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const query = `
      INSERT INTO categories (name, slug, description, sort_order, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [name, slug, description, sort_order, imageUrl]);
    
    res.status(201).json({
      error: false,
      message: 'Category created successfully',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('slug')) {
        return res.status(400).json({
          error: true,
          message: 'A category with this slug already exists. Please choose a different slug.'
        });
      } else if (error.sqlMessage.includes('name')) {
        return res.status(400).json({
          error: true,
          message: 'A category with this name already exists. Please choose a different name.'
        });
      }
    }
    
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Update category (admin only)
router.put('/:id', [
  authenticateToken,
  requireAuth,
  upload.single('image'), // Handle single image upload
  body('name').notEmpty().withMessage('Category name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const categoryId = req.params.id;
    const { name, slug, description, sort_order, active } = req.body;
    
    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    let query;
    let params;
    
    if (imageUrl) {
      // Update with new image
      query = `
        UPDATE categories SET
          name = ?, slug = ?, description = ?, sort_order = ?, active = ?, image_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [name, slug, description, sort_order, active, imageUrl, categoryId];
    } else {
      // Update without changing image
      query = `
        UPDATE categories SET
          name = ?, slug = ?, description = ?, sort_order = ?, active = ?, 
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [name, slug, description, sort_order, active, categoryId];
    }
    
    const [result] = await db.execute(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Category not found'
      });
    }
    
    res.json({
      error: false,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('slug')) {
        return res.status(400).json({
          error: true,
          message: 'A category with this slug already exists. Please choose a different slug.'
        });
      } else if (error.sqlMessage.includes('name')) {
        return res.status(400).json({
          error: true,
          message: 'A category with this name already exists. Please choose a different name.'
        });
      }
    }
    
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Delete category (admin only)
router.delete('/:id', [authenticateToken, requireAuth], async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category has products
    const [products] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [categoryId]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({
        error: true,
        message: 'Cannot delete category with existing products'
      });
    }
    
    // Soft delete - set active to false
    const query = 'UPDATE categories SET active = FALSE WHERE id = ?';
    
    const [result] = await db.execute(query, [categoryId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Category not found'
      });
    }
    
    res.json({
      error: false,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
