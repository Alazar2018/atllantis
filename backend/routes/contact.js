const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendContactFormEmail } = require('../services/emailService');

const router = express.Router();

// Contact form submission
router.post('/submit', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Send email to admin
    const emailResult = await sendContactFormEmail({
      name,
      email,
      subject,
      message
    });

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

module.exports = router;
