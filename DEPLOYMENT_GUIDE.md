# VPS Deployment Guide for Atlantic Leather E-commerce

This guide will help you deploy your Atlantic Leather e-commerce application to a VPS server, starting with the backend and then the frontend.

## Prerequisites

- VPS server with Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access to the server
- Domain name (optional but recommended)
- SSH access to your server

## Server Requirements

- **Minimum**: 2GB RAM, 1 CPU core, 20GB storage
- **Recommended**: 4GB RAM, 2 CPU cores, 40GB storage
- **Database**: MySQL 8.0+ or MariaDB 10.3+

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Software
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Install UFW firewall
sudo apt install ufw -y
```

### 1.3 Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001  # Backend port
sudo ufw enable
```

### 1.4 Configure MySQL
```bash
sudo mysql_secure_installation
```

Create database and user:
```sql
sudo mysql -u root -p
```

```sql
CREATE DATABASE atlantic_leather_db;
CREATE USER 'atlantic_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON atlantic_leather_db.* TO 'atlantic_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 2: Deploy Backend

### 2.1 Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/your-username/altantis.git
sudo chown -R $USER:$USER /var/www/altantis
cd /var/www/altantis/backend
```

### 2.2 Install Dependencies
```bash
npm install --production
```

### 2.3 Configure Environment
```bash
cp env.example .env
nano .env
```

Update the `.env` file with your production values:
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=atlantic_user
DB_PASSWORD=your_secure_password
DB_NAME=atlantic_leather_db
DB_PORT=3306

# JWT Configuration (Generate strong secrets)
JWT_SECRET=your_super_secret_jwt_key_here_must_be_at_least_32_chars_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_must_be_at_least_32_chars_long
JWT_REFRESH_EXPIRES_IN=7d

# Private API Key for Customer Access
PRIVATE_API_KEY=your_private_api_key_for_customers_here

# Email Configuration (Gmail SMTP)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (Update with your domain)
FRONTEND_URL=https://yourdomain.com

# Admin Default Password
ADMIN_DEFAULT_PASSWORD=admin123
```

### 2.4 Setup Database
```bash
npm run setup
```

### 2.5 Create PM2 Configuration
Create `ecosystem.config.js` in the backend directory:
```bash
nano ecosystem.config.js
```

### 2.6 Start Backend with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 3: Deploy Frontend

### 3.1 Install Frontend Dependencies
```bash
cd /var/www/altantis
npm install
```

### 3.2 Configure Frontend Environment
```bash
cp env.example .env.local
nano .env.local
```

Update `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/public
NEXT_PUBLIC_PRIVATE_API_KEY=your_private_api_key_for_customers_here
```

### 3.3 Build Frontend
```bash
npm run build
```

### 3.4 Start Frontend with PM2
```bash
pm2 start npm --name "atlantic-frontend" -- start
pm2 save
```

## Step 4: Configure Nginx

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/atlantic-leather
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/atlantic-leather /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: SSL Certificate (Optional but Recommended)

### 5.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

## Step 6: Monitoring and Maintenance

### 6.1 Check PM2 Status
```bash
pm2 status
pm2 logs
```

### 6.2 Monitor System Resources
```bash
htop
df -h
```

### 6.3 Backup Database
```bash
mysqldump -u atlantic_user -p atlantic_leather_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Common Issues:

1. **Port 3001 not accessible**: Check firewall and Nginx configuration
2. **Database connection failed**: Verify MySQL credentials and service status
3. **Frontend build fails**: Check Node.js version and dependencies
4. **File upload issues**: Check uploads directory permissions

### Useful Commands:

```bash
# Check PM2 processes
pm2 status

# Restart services
pm2 restart all

# View logs
pm2 logs atlantic-backend
pm2 logs atlantic-frontend

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql

# Check disk usage
df -h

# Check memory usage
free -h
```

## Security Considerations

1. **Change default passwords** immediately after deployment
2. **Keep system updated** regularly
3. **Monitor logs** for suspicious activity
4. **Use strong JWT secrets** (32+ characters)
5. **Enable rate limiting** in production
6. **Regular backups** of database and files
7. **SSL certificate** for HTTPS

## Performance Optimization

1. **Enable gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Optimize images** before upload
4. **Monitor database performance**
5. **Use caching** where appropriate

## Support

For issues or questions:
1. Check the logs: `pm2 logs`
2. Verify configuration files
3. Test database connection
4. Check firewall settings
5. Review Nginx configuration

Remember to replace placeholder values with your actual configuration before deployment!
