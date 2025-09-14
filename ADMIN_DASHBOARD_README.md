# Atlantic Leather Admin Dashboard

A comprehensive admin dashboard built with Next.js 14, TypeScript, and Tailwind CSS for managing the Atlantic Leather business operations.

## Features

### 🏠 Dashboard Overview
- **Statistics Cards**: Total products, orders, customers, and revenue
- **Quick Actions**: Add products, view orders, send communications
- **Recent Orders**: Latest customer orders with status tracking
- **Low Stock Alerts**: Products running low on inventory

### 📦 Product Management
- **Product Catalog**: View all products with search and filtering
- **Add/Edit Products**: Create and modify product listings
- **Inventory Management**: Track stock levels and product status
- **Category Management**: Organize products by categories
- **Image Management**: Upload and manage product images
- **Pricing Control**: Set regular and sale prices

### 🛒 Order Management
- **Order Tracking**: Monitor order status and payment status
- **Customer Information**: View customer details and order history
- **Status Updates**: Update order processing stages
- **Payment Tracking**: Monitor payment status
- **Order Details**: View complete order information

### 📧 Communication Tools
- **Email Management**: Send bulk emails to customers
- **SMS Communication**: Send SMS notifications
- **Customer Selection**: Choose specific customers or send to all
- **Communication History**: Track all sent messages
- **Template Support**: Pre-built email templates for common scenarios

### 👥 Customer Management
- **Customer Database**: View all customer information
- **Order History**: Track customer purchase patterns
- **Contact Information**: Manage email and phone details

### 📊 Reporting & Analytics
- **Sales Reports**: Track revenue and order trends
- **Product Performance**: Analyze best-selling products
- **Customer Insights**: Understand customer behavior

## Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **API Integration**: Custom API client with fetch
- **Authentication**: JWT-based authentication

## Project Structure

```
app/admin/
├── layout.tsx              # Admin layout with sidebar and header
├── page.tsx                # Dashboard overview
├── login/page.tsx          # Admin authentication
├── products/page.tsx       # Product management
├── orders/page.tsx         # Order management
├── communication/page.tsx  # Email/SMS communication
├── categories/page.tsx     # Category management
├── customers/page.tsx      # Customer management
└── reports/page.tsx        # Analytics and reporting

components/admin/
├── AdminHeader.tsx         # Top navigation bar
├── AdminSidebar.tsx        # Left sidebar navigation
└── [other components]      # Reusable admin components

lib/
└── api.ts                  # API client and utilities
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running (see backend README)
- MySQL database configured

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd atlantis
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the admin dashboard**
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Admin Login: http://localhost:3000/admin/login

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

## API Integration

The admin dashboard integrates with the Express.js backend through the `lib/api.ts` file, which provides:

- **Authentication**: Login, logout, and token management
- **Products**: CRUD operations for product management
- **Orders**: Order retrieval and status updates
- **Categories**: Category management operations
- **Communication**: Email and SMS sending capabilities
- **Dashboard**: Statistics and analytics data

### API Endpoints Used

- `POST /api/auth/login` - Admin authentication
- `GET /api/products` - Retrieve products
- `POST /api/products` - Create new products
- `PUT /api/products/:id` - Update products
- `DELETE /api/products/:id` - Delete products
- `GET /api/orders` - Retrieve orders
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/communication/email` - Send emails
- `POST /api/communication/sms` - Send SMS

## Usage Guide

### Managing Products

1. **Navigate to Products** from the sidebar
2. **Add New Product**: Click "Add Product" button
3. **Fill Product Details**: Title, description, price, category, stock
4. **Upload Images**: Add product images
5. **Set Variants**: Configure colors, sizes, and features
6. **Save Product**: Product will be added to the catalog

### Processing Orders

1. **Go to Orders** from the sidebar
2. **View Order Details**: Click on any order to see full information
3. **Update Status**: Change order status using the dropdown
4. **Track Payment**: Monitor payment status
5. **Communicate**: Send updates via email or SMS

### Customer Communication

1. **Access Communication** from the sidebar
2. **Choose Type**: Select Email or SMS tab
3. **Select Customers**: Choose recipients from the customer list
4. **Compose Message**: Write your email subject/message or SMS
5. **Send**: Deliver your message to selected customers

### Dashboard Analytics

1. **View Overview**: Check key metrics on the main dashboard
2. **Monitor Trends**: Track daily/weekly performance
3. **Identify Issues**: Spot low stock and pending orders
4. **Quick Actions**: Access common tasks directly

## Customization

### Styling
- Modify `tailwind.config.js` for theme changes
- Update color schemes in component classes
- Customize component layouts in individual files

### Adding New Features
1. Create new page components in `app/admin/`
2. Add navigation items in `components/admin/AdminSidebar.tsx`
3. Implement API calls in `lib/api.ts`
4. Update types and interfaces as needed

### Authentication
- Modify login logic in `app/admin/login/page.tsx`
- Update token handling in `lib/api.ts`
- Add role-based access control if needed

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Admin pages require valid authentication
- **Input Validation**: Form validation and sanitization
- **CSRF Protection**: Built-in Next.js security features
- **Environment Variables**: Secure configuration management

## Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component optimization
- **Lazy Loading**: Components load only when needed
- **Caching**: API response caching and optimization

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment option
- **AWS/GCP**: Self-hosted deployment
- **Docker**: Containerized deployment

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check backend server is running
   - Verify API URL in environment variables
   - Check CORS configuration on backend

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **Build Errors**
   - Clear `.next` folder
   - Reinstall dependencies
   - Check TypeScript compilation

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Check the backend README for API documentation
- Review the code comments for implementation details
- Open an issue for bugs or feature requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This admin dashboard is designed to work seamlessly with the Express.js backend. Ensure both frontend and backend are properly configured and running for full functionality.
