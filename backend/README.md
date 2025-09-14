# Atlantic Leather Backend API

A comprehensive Express.js backend API for managing Atlantic Leather business operations, including products, orders, customer communication, and admin authentication.

## Features

### 🔐 **Enhanced Authentication System**
- **JWT-based authentication** with access and refresh tokens
- **Access tokens** expire in 15 minutes (configurable)
- **Refresh tokens** expire in 7 days (configurable)
- **Automatic token refresh** via axios interceptors on frontend
- **Secure logout** with token revocation
- **Role-based access control** (admin, manager)

### 📦 **Product Management**
- CRUD operations for products
- Image upload and management
- Category management
- Stock tracking
- Sale price management
- Product variants (colors, sizes, features)

### 🛒 **Order Management**
- Customer order processing
- Order status tracking
- Payment status management
- Order history and analytics

### 📧 **Communication Tools**
- Email notifications (order confirmations, updates)
- SMS notifications via Twilio
- Communication logging
- Bulk messaging capabilities

### 📊 **Admin Dashboard Support**
- Comprehensive API endpoints for admin operations
- Real-time data access
- Secure admin authentication

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer
- **Email**: Nodemailer
- **SMS**: Twilio
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ database
- Email service (Gmail, SendGrid, etc.)
- Twilio account (for SMS functionality)

## Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd atlantis/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file based on `.env.example`:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=atlantic_leather
   DB_PORT=3306
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Private API Key for Customer Access (No Login Required)
   PRIVATE_API_KEY=your_private_api_key_for_customers_here
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   
   # SMS Configuration (Twilio)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # File Upload Configuration
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   ```bash
   # Create database and tables
   mysql -u root -p < database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Authentication System

### Token Management

The backend implements a dual-token system for enhanced security:

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal

### API Endpoints

#### Public API (Customer Access - No Login Required)
**Note:** All public endpoints require a valid `x-api-key` header or `apiKey` query parameter.

- `GET /api/public/products` - Get all active products
- `GET /api/public/products/:id` - Get single product by ID
- `GET /api/public/categories` - Get all active categories
- `POST /api/public/orders` - Submit customer order

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/users` - Create new user (admin only)
- `GET /api/auth/users` - Get all users (admin only)

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/images` - Upload product images

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (public endpoint)
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment status

#### Communication
- `POST /api/communication/email/order-confirmation` - Send emails
- `POST /api/communication/sms/send` - Send SMS
- `GET /api/communication/logs` - Get communication logs

## Database Schema

The database includes the following main tables:

- **users** - Admin and manager accounts
- **categories** - Product categories
- **products** - Product information
- **product_images** - Product image URLs
- **product_colors** - Product color variants
- **product_sizes** - Product size variants
- **product_features** - Product features
- **orders** - Customer orders
- **order_items** - Order line items
- **communication_logs** - Email and SMS logs

## Security Features

- **JWT Authentication** with refresh token rotation
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** using express-validator
- **Helmet** for security headers
- **Token Revocation** on logout
- **Private API Key System** for customer access without authentication

## Private API Key System

The backend implements a private API key system that allows customer-facing applications to access product information and submit orders without requiring user authentication:

### How It Works
1. **Private Key**: A secret key is configured in the backend environment variables
2. **Header Authentication**: Frontend applications must include the key in the `x-api-key` header
3. **Query Parameter Alternative**: The key can also be passed as `apiKey` query parameter
4. **Secure Access**: Only applications with the correct key can access public endpoints

### Use Cases
- **Product Browsing**: Customers can view products without creating accounts
- **Order Submission**: Customers can place orders with just their contact information
- **Category Browsing**: Customers can explore product categories
- **No User Management**: Simplifies the customer experience

### Security Benefits
- **No Authentication Required**: Reduces friction for customers
- **Controlled Access**: Only authorized applications can use the API
- **Rate Limiting**: Prevents abuse while maintaining accessibility
- **Audit Trail**: All requests are logged for monitoring

## Frontend Integration

The backend is designed to work seamlessly with the Next.js admin dashboard:

- **Automatic token refresh** via axios interceptors
- **Secure API communication** with JWT headers
- **Real-time data synchronization**
- **Error handling** and user feedback

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### File Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── database/
│   └── schema.sql           # Database schema
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Product routes
│   ├── categories.js        # Category routes
│   ├── orders.js            # Order routes
│   └── communication.js     # Communication routes
├── server.js                # Main server file
├── package.json             # Dependencies
└── .env.example            # Environment variables template
```

## Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong, unique JWT secrets
- Configure production database credentials
- Set up production email and SMS services

### Security Considerations
- Use HTTPS in production
- Implement proper logging
- Set up monitoring and alerting
- Regular security updates
- Database backup strategy

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MySQL service is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Clear browser localStorage if needed

3. **File Upload Issues**
   - Ensure upload directory exists
   - Check file size limits
   - Verify multer configuration

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## Support

For support and questions:
- Check the API documentation
- Review error logs
- Open an issue for bugs
- Contact the development team

## License

This project is licensed under the MIT License.

---

**Note**: This backend API is designed to work with the Atlantic Leather frontend admin dashboard. Ensure both frontend and backend are properly configured for full functionality.
