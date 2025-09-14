const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Set default JWT secrets for development if not provided
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️ JWT_SECRET not set or too short, using development default')
  process.env.JWT_SECRET = 'atlantic_leather_jwt_secret_key_2024_development_32_chars'
}

if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
  console.warn('⚠️ JWT_REFRESH_SECRET not set or too short, using development default')
  process.env.JWT_REFRESH_SECRET = 'atlantic_leather_refresh_secret_key_2024_development_32_chars'
}

// Token management
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
}

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}

// Middleware functions
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  const decoded = verifyToken(token)
  
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired access token' })
  }

  req.user = decoded
  next()
}

const authenticateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' })
  }

  const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET)
  if (!decoded || decoded.type !== 'refresh') {
    return res.status(403).json({ message: 'Invalid or expired refresh token' })
  }

  req.user = decoded
  next()
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

const requireAuth = (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Authentication required' })
  }
  next()
}

// Utility functions
const hashPassword = async (password) => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  requireAdmin,
  requireAuth,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  comparePassword
}
