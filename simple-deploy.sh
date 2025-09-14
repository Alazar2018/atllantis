#!/bin/bash

# Simple Atlantic Leather Deployment Script
# Upload this to your VPS and run with: sudo ./simple-deploy.sh

set -e

echo "🚀 Atlantic Leather Simple Deployment"
echo "====================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get domain name
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN

echo -e "${BLUE}Installing required software...${NC}"

# Install software
apt update
apt install -y nginx
npm install -g pm2
apt install -y ufw
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
ufw --force enable
apt install -y certbot python3-certbot-nginx

echo -e "${GREEN}Software installed!${NC}"

# Navigate to project
cd /var/www/altantis

echo -e "${BLUE}Installing dependencies...${NC}"

# Install backend dependencies
cd backend
npm install sqlite3 --save
npm install --production

# Install frontend dependencies
cd ..
npm install

echo -e "${GREEN}Dependencies installed!${NC}"

# Create backend .env file
echo -e "${BLUE}Creating configuration files...${NC}"
cd backend

cat > .env << EOF
PORT=3001
NODE_ENV=production
DB_TYPE=sqlite
DB_PATH=./data/atlantic_leather.db
JWT_SECRET=atlantic_leather_jwt_secret_2024_secure_key_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=atlantic_leather_refresh_secret_2024_secure_key_32_chars
JWT_REFRESH_EXPIRES_IN=7d
PRIVATE_API_KEY=atlantic_leather_private_api_key_2024_secure_32_chars
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
FRONTEND_URL=https://$DOMAIN
ADMIN_DEFAULT_PASSWORD=admin123
EOF

# Create frontend .env.local file
cd ..
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN/api/public
NEXT_PUBLIC_PRIVATE_API_KEY=atlantic_leather_private_api_key_2024_secure_32_chars
EOF

echo -e "${GREEN}Configuration files created!${NC}"

# Create data directory
mkdir -p backend/data

# Setup database
echo -e "${BLUE}Setting up database...${NC}"
cd backend
npm run setup

# Start services
echo -e "${BLUE}Starting services...${NC}"
pm2 start ecosystem.config.js
cd ..
pm2 start npm --name "atlantic-frontend" -- start
pm2 save
pm2 startup

echo -e "${GREEN}Services started!${NC}"

# Configure Nginx
echo -e "${BLUE}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/atlantic-leather << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
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
    
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
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

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/atlantic-leather /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo -e "${GREEN}Nginx configured!${NC}"

# Setup SSL
echo -e "${BLUE}Setting up SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

echo -e "${GREEN}SSL certificate setup!${NC}"

# Final check
echo -e "${BLUE}Checking deployment...${NC}"
pm2 status
systemctl status nginx --no-pager -l

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Your application is now accessible at:${NC}"
echo "Frontend: https://$DOMAIN"
echo "Backend API: https://$DOMAIN/api/"
echo "Health Check: https://$DOMAIN/health"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "1. Change admin password: admin123"
echo "2. Update Gmail credentials in .env file"
echo "3. Your database is: ./data/atlantic_leather.db"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "View logs: pm2 logs"
echo "Restart: pm2 restart all"
echo "Status: pm2 status"
echo ""
echo -e "${GREEN}Deployment completed! 🚀${NC}"
