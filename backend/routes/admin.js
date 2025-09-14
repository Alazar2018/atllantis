const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('../config/database').promise
const { authenticateToken } = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

// Change admin password
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    // Get current admin data
    const [admins] = await db.execute(
      'SELECT id, username, password FROM admins WHERE id = ?',
      [adminId]
    );

    if (!admins.length) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const admin = admins[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.execute(
      'UPDATE admins SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, adminId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Update admin profile
router.put('/profile', [
  authenticateToken,
  body('full_name').optional().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must be less than 500 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { full_name, email, phone, address } = req.body;
    const adminId = req.user.id;

    // Update profile
    await db.execute(
      'UPDATE admins SET full_name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [full_name, email, phone, address, adminId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Upload avatar
router.post('/upload-avatar', [
  authenticateToken,
  // Note: You'll need to add multer middleware for file upload
], async (req, res) => {
  try {
    // This will be implemented with multer
    res.json({
      success: true,
      message: 'Avatar upload functionality will be implemented'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

// Get admin profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;

    const [admins] = await db.execute(
      'SELECT id, username, full_name, email, phone, address, created_at, updated_at FROM admins WHERE id = ?',
      [adminId]
    );

    if (!admins.length) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const admin = admins[0];

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

module.exports = router
