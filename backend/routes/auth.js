const express = require('express')
const { body, validationResult } = require('express-validator')
const { 
  authenticateToken, 
  requireAdmin, 
  hashPassword, 
  comparePassword,
  generateAccessToken,
  generateRefreshToken
} = require('../middleware/auth')
const db = require('../config/database').promise
const router = express.Router()

// Login route
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { username, password } = req.body

    // Get user from database
    const [users] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND active = 1',
      [username]
    )

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token in database (optional - for token revocation)
    await db.execute(
      'UPDATE users SET refresh_token = ?, last_login = NOW() WHERE id = ?',
      [refreshToken, user.id]
    )

    // Remove sensitive data
    delete user.password
    delete user.refresh_token

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
})

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        message: 'Refresh token is required' 
      })
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken')
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    
    let decoded
    try {
      decoded = jwt.verify(refreshToken, secret)
    } catch (error) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid or expired refresh token' 
      })
    }

    if (decoded.type !== 'refresh') {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token type' 
      })
    }

    // Get user from database
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ? AND active = 1 AND refresh_token = ?',
      [decoded.id, refreshToken]
    )

    if (users.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'User not found or token revoked' 
      })
    }

    const user = users[0]

    // Generate new tokens
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)

    // Update refresh token in database
    await db.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [newRefreshToken, user.id]
    )

    // Remove sensitive data
    delete user.password
    delete user.refresh_token

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    })

  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
})

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Revoke refresh token by setting it to null
    await db.execute(
      'UPDATE users SET refresh_token = NULL WHERE id = ?',
      [req.user.id]
    )

    res.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
})

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    res.json({
      success: true,
      data: users[0]
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
})

// Change password
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { currentPassword, newPassword } = req.body

    // Get current user with password
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    const user = users[0]

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    )

    res.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
})

// Create new user (admin only)
router.post('/users', [
  requireAdmin,
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'manager']).withMessage('Role must be admin or manager')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { username, password, email, role } = req.body

    // Check if username already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (username, password, email, role, active) VALUES (?, ?, ?, ?, 1)',
      [username, hashedPassword, email, role]
    )

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        username,
        email,
        role
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
})

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, role, active, created_at, last_login FROM users ORDER BY created_at DESC'
    )

    res.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
})

module.exports = router
