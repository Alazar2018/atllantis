#!/bin/bash

# Atlantic Leather Complete Deployment Script
# Run this script on your VPS server

set -e

echo "🚀 Atlantic Leather Deployment Script"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN=""
DB_PASSWORD=""
JWT_SECRET=""
PRIVATE_API_KEY=""
GMAIL_USER=""
GMAIL_APP_PASSWORD=""

# Function to get user input
get_input() {
    local prompt="$1"
    local var_name="$2"
    local is_password="$3"
    
    if [ "$is_password" = "true" ]; then
        read -s -p "$prompt: " input
        echo
    else
        read -p "$prompt: " input
    fi
    
    eval "$var_name='$input'"
}

# Function to generate random string
generate_random_string() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

echo -e "${BLUE}Welcome to Atlantic Leather Deployment!${NC}"
echo ""
echo "This script will:"
echo "1. Install required software (Node.js, MySQL, Nginx, PM2)"
echo "2. Clone your repository"
echo "3. Setup database"
echo "4. Deploy backend and frontend"
echo "5. Configure Nginx reverse proxy"
echo ""

# Get configuration from user
echo -e "${YELLOW}Please provide the following information:${NC}"
echo ""

get_input "Your domain name (e.g., yourdomain.com)" DOMAIN
get_input "Database password for 'atlantic_user'" DB_PASSWORD true
get_input "Gmail address for notifications" GMAIL_USER
get_input "Gmail app password" GMAIL_APP_PASSWORD true

# Generate secrets
JWT_SECRET=$(generate_random_string)
JWT_REFRESH_SECRET=$(generate_random_string)
PRIVATE_API_KEY=$(generate_random_string)

echo ""
echo -e "${GREEN}Configuration Summary:${NC}"
echo "Domain: $DOMAIN"
echo "Database User: atlantic_user"
echo "JWT Secret: [Generated]"
echo "Private API Key: [Generated]"
echo "Gmail: $GMAIL_USER"
echo ""

read -p "Continue with deployment? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo -e "${BLUE}Starting deployment...${NC}"

# Step 1: Update system and install software
echo -e "${YELLOW}Step 1: Installing required software...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common

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

# Install Certbot
apt install -y certbot python3-certbot-nginx

echo -e "${GREEN}Software installation completed!${NC}"

# Step 2: Clone repository
echo -e "${YELLOW}Step 2: Setting up project...${NC}"
mkdir -p /var/www
cd /var/www

# Note: You'll need to replace this with your actual repository URL
echo "Please clone your repository manually:"
echo "git clone https://github.com/your-username/altantis.git"
echo "Then run this script again."
echo ""
echo "Or if you've already cloned it, press Enter to continue..."
read

if [ ! -d "altantis" ]; then
    echo -e "${RED}Repository not found. Please clone it first.${NC}"
    exit 1
fi

cd altantis
chown -R $USER:$USER /var/www/altantis

echo -e "${GREEN}Project setup completed!${NC}"

# Step 3: Setup database
echo -e "${YELLOW}Step 3: Setting up database...${NC}"

# Create database and user
mysql -u root -ptemp_root_password -e "CREATE DATABASE IF NOT EXISTS atlantic_leather_db;"
mysql -u root -ptemp_root_password -e "CREATE USER IF NOT EXISTS 'atlantic_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -u root -ptemp_root_password -e "GRANT ALL PRIVILEGES ON atlantic_leather_db.* TO 'atlantic_user'@'localhost';"
mysql -u root -ptemp_root_password -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}Database setup completed!${NC}"

# Step 4: Deploy backend
echo -e "${YELLOW}Step 4: Deploying backend...${NC}"
cd /var/www/altantis/backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_USER=atlantic_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=atlantic_leather_db
DB_PORT=3306
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d
PRIVATE_API_KEY=$PRIVATE_API_KEY
GMAIL_USER=$GMAIL_USER
GMAIL_APP_PASSWORD=$GMAIL_APP_PASSWORD
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://$DOMAIN
ADMIN_DEFAULT_PASSWORD=admin123
EOF

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Test database connection
npm run test:db

# Setup database
npm run setup

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}Backend deployment completed!${NC}"

# Step 5: Deploy frontend
echo -e "${YELLOW}Step 5: Deploying frontend...${NC}"
cd /var/www/altantis

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN/api/public
NEXT_PUBLIC_PRIVATE_API_KEY=$PRIVATE_API_KEY
EOF

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "atlantic-frontend" -- start
pm2 save

echo -e "${GREEN}Frontend deployment completed!${NC}"

# Step 6: Configure Nginx
echo -e "${YELLOW}Step 6: Configuring Nginx...${NC}"

# Create Nginx configuration
cat > /etc/nginx/sites-available/atlantic-leather << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Backend API routes
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend routes
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable Atlantic Leather site
ln -s /etc/nginx/sites-available/atlantic-leather /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo -e "${GREEN}Nginx configuration completed!${NC}"

# Step 7: Setup SSL
echo -e "${YELLOW}Step 7: Setting up SSL certificate...${NC}"
echo "Setting up SSL certificate with Certbot..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $GMAIL_USER

echo -e "${GREEN}SSL certificate setup completed!${NC}"

# Final verification
echo -e "${YELLOW}Step 8: Verifying deployment...${NC}"

# Check PM2 status
echo "PM2 Status:"
pm2 status

# Check services
echo ""
echo "Service Status:"
systemctl status nginx --no-pager -l
systemctl status mysql --no-pager -l

# Test endpoints
echo ""
echo "Testing endpoints..."
curl -f http://localhost:3001/health && echo "✅ Backend health check passed"
curl -f http://localhost:3000 >/dev/null && echo "✅ Frontend is accessible"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Your application is now accessible at:${NC}"
echo "Frontend: https://$DOMAIN"
echo "Backend API: https://$DOMAIN/api/"
echo "Health Check: https://$DOMAIN/health"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo "Admin Default Password: admin123 (CHANGE THIS IMMEDIATELY!)"
echo "Database User: atlantic_user"
echo "Database Name: atlantic_leather_db"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "View logs: pm2 logs"
echo "Restart services: pm2 restart all"
echo "Monitor: pm2 monit"
echo "Backup database: mysqldump -u atlantic_user -p atlantic_leather_db > backup.sql"
echo ""
echo -e "${GREEN}Deployment completed! 🚀${NC}"
