# Quick Deployment Guide - Atlantic Leather E-commerce

## Prerequisites
- VPS server with Ubuntu 20.04+ (2GB RAM minimum, 4GB recommended)
- Domain name (optional but recommended)
- SSH access to your server

## Step 1: Server Setup

### Connect to your VPS:
```bash
ssh root@your-vps-ip-address
```

### Run the setup script:
```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-username/altantis/main/setup-server.sh | bash
```

**OR manually run these commands:**

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install MySQL
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# Wait for MySQL to start
sleep 5

# Secure MySQL installation (automated)
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'temp_root_password';"
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

# Install Nginx
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Install PM2
npm install -g pm2

# Install firewall
apt install -y ufw
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
ufw --force enable

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

## Step 2: Clone Your Repository

```bash
# Create project directory
mkdir -p /var/www
cd /var/www

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/altantis.git
cd altantis

# Set proper permissions
chown -R $USER:$USER /var/www/altantis
```

## Step 3: Setup Database

```bash
# Secure MySQL installation
mysql_secure_installation

# Create database and user
mysql -u root -ptemp_root_password
```

In MySQL prompt:
```sql
CREATE DATABASE atlantic_leather_db;
CREATE USER 'atlantic_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON atlantic_leather_db.* TO 'atlantic_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 4: Deploy Backend

```bash
cd /var/www/altantis/backend

# Install dependencies
npm install --production

# Copy environment file
cp env.example .env

# Edit environment file
nano .env
```

**Update .env with your production values:**
```env
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_USER=atlantic_user
DB_PASSWORD=your_secure_password
DB_NAME=atlantic_leather_db
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here_must_be_at_least_32_chars_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_must_be_at_least_32_chars_long
PRIVATE_API_KEY=your_private_api_key_for_customers_here
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
FRONTEND_URL=https://yourdomain.com
```

**Continue deployment:**
```bash
# Test database connection
npm run test:db

# Setup database
npm run setup

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 5: Deploy Frontend

```bash
cd /var/www/altantis

# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Edit environment file
nano .env.local
```

**Update .env.local:**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/public
NEXT_PUBLIC_PRIVATE_API_KEY=your_private_api_key_for_customers_here
```

**Continue deployment:**
```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "atlantic-frontend" -- start
pm2 save
```

## Step 6: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/atlantic-leather
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Backend API routes
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend routes
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable the site:**
```bash
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable Atlantic Leather site
ln -s /etc/nginx/sites-available/atlantic-leather /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Step 7: Setup SSL Certificate (Optional but Recommended)

```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 8: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check services
systemctl status nginx mysql

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3000
```

## Useful Commands

```bash
# View logs
pm2 logs atlantic-backend
pm2 logs atlantic-frontend

# Restart services
pm2 restart all

# Monitor resources
htop

# Check disk usage
df -h

# Backup database
mysqldump -u atlantic_user -p atlantic_leather_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Common Issues:

1. **Port 3001 not accessible**: Check firewall and Nginx configuration
2. **Database connection failed**: Verify MySQL credentials and service status
3. **Frontend build fails**: Check Node.js version and dependencies
4. **File upload issues**: Check uploads directory permissions

### Check Logs:
```bash
pm2 logs
journalctl -u nginx -f
journalctl -u mysql -f
```

## Security Checklist

- [ ] Change default passwords
- [ ] Update system packages
- [ ] Configure firewall
- [ ] Setup SSL certificate
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting
- [ ] Regular backups
- [ ] Monitor logs

Your application should now be accessible at:
- **Frontend**: https://yourdomain.com
- **Backend API**: https://yourdomain.com/api/
- **Health Check**: https://yourdomain.com/health
