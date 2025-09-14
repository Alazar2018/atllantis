const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// CORS Configuration - Restrict to specific origins
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL] 
  : [
      'http://localhost:3000', 
      'http://localhost:3001',
      'https://x5x6mnh3-3000.euw.devtunnels.ms'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-csrf-token', 'X-Requested-With']
}));

const PORT = process.env.PORT || 3001;

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const communicationRoutes = require('./routes/communication');
const publicRoutes = require('./routes/public');
const reportsRoutes = require('./routes/reports');
const customersRoutes = require('./routes/customers');
const notificationRoutes = require('./routes/notifications');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const notificationsApiRoutes = require('./routes/notifications_api');
const contactRoutes = require('./routes/contact');

// Import database connection
const db = require('./config/database');

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting - DISABLED for development
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute for development
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests per minute for development
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware - only for non-multipart requests
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Skip body parsing for multipart requests (let multer handle it)
    next();
  } else {
    // Parse JSON and URL-encoded bodies for other requests
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Skip URL encoding for multipart requests
    next();
  } else {
    // Parse URL-encoded bodies for other requests
    express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
  }
});

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Atlantic Leather Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Move admin routes before products to avoid conflicts
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications-api', notificationsApiRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Test database connection and start server
async function startServer() {
  try {
    const connection = await db.promise.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    
    // Start server after database connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      // Start low stock monitoring
      console.log('📦 Starting low stock monitoring...');
      
      // Import stock notification service
      const stockNotificationService = require('./services/stockNotificationService');
      
      // Check immediately on startup
      setTimeout(() => {
        stockNotificationService.checkLowStock();
      }, 5000); // Wait 5 seconds after startup
      
      // Check every hour
      setInterval(() => {
        stockNotificationService.checkLowStock();
      }, 60 * 60 * 1000); // 1 hour
      
      console.log('✅ Low stock monitoring started (checks every hour)');
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await db.end();
    console.log('Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database connection:', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await db.end();
    console.log('Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database connection:', err);
    process.exit(1);
  }
});

module.exports = app;
