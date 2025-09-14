const { body, param, query, validationResult } = require('express-validator');

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  // Sanitize body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  // Sanitize params
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    }
  }

  next();
};

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  id: param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  email: body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  password: body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  username: body('username').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  name: body('name').isLength({ min: 1, max: 100 }).trim().escape().withMessage('Name must be 1-100 characters'),
  description: body('description').optional().isLength({ max: 1000 }).trim().escape().withMessage('Description must be less than 1000 characters'),
  price: body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  quantity: body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
};

module.exports = {
  sanitizeInput,
  validateRequest,
  commonValidations
};
