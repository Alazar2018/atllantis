#!/bin/bash

# Atlantic Leather Server Setup Script
# Run this script on a fresh Ubuntu VPS to install all required software

set -e  # Exit on any error

echo "🚀 Starting Atlantic Leather Server Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log "${RED}This script must be run as root. Please use: sudo $0${NC}"
    exit 1
fi

log "${BLUE}Setting up Atlantic Leather E-commerce Server...${NC}"

# Update system
log "${YELLOW}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential packages
log "${YELLOW}Installing essential packages...${NC}"
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18
log "${YELLOW}Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "${GREEN}Node.js version: $NODE_VERSION${NC}"
log "${GREEN}npm version: $NPM_VERSION${NC}"

# Install MySQL
log "${YELLOW}Installing MySQL Server...${NC}"
apt install -y mysql-server

# Start and enable MySQL
systemctl start mysql
systemctl enable mysql

# Secure MySQL installation
log "${YELLOW}Securing MySQL installation...${NC}"
mysql_secure_installation

# Install Nginx
log "${YELLOW}Installing Nginx...${NC}"
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Install PM2 globally
log "${YELLOW}Installing PM2 process manager...${NC}"
npm install -g pm2

# Install UFW firewall
log "${YELLOW}Installing and configuring UFW firewall...${NC}"
apt install -y ufw

# Configure firewall
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001  # Backend port
ufw allow 3000  # Frontend port (temporary, will be proxied through Nginx)

# Install Certbot for SSL certificates
log "${YELLOW}Installing Certbot for SSL certificates...${NC}"
apt install -y certbot python3-certbot-nginx

# Create project directory
log "${YELLOW}Creating project directory...${NC}"
mkdir -p /var/www
chown -R $SUDO_USER:$SUDO_USER /var/www

# Create log directories
log "${YELLOW}Creating log directories...${NC}"
mkdir -p /var/log/pm2
mkdir -p /var/log/atlantic
chown -R $SUDO_USER:$SUDO_USER /var/log/pm2
chown -R $SUDO_USER:$SUDO_USER /var/log/atlantic

# Create uploads directory
log "${YELLOW}Creating uploads directory...${NC}"
mkdir -p /var/www/uploads
chown -R $SUDO_USER:$SUDO_USER /var/www/uploads
chmod 755 /var/www/uploads

# Setup MySQL database
log "${YELLOW}Setting up MySQL database...${NC}"
log "${BLUE}You will need to create the database and user manually.${NC}"
log "${BLUE}Run the following commands:${NC}"
echo ""
echo "sudo mysql -u root -p"
echo ""
echo "CREATE DATABASE atlantic_leather_db;"
echo "CREATE USER 'atlantic_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
echo "GRANT ALL PRIVILEGES ON atlantic_leather_db.* TO 'atlantic_user'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"
echo ""

# Create systemd service for PM2
log "${YELLOW}Setting up PM2 systemd service...${NC}"
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

# Configure Nginx
log "${YELLOW}Configuring Nginx...${NC}"
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create Atlantic Leather Nginx configuration
cat > /etc/nginx/sites-available/atlantic-leather << 'EOF'
# Nginx configuration for Atlantic Leather E-commerce
# This is a basic configuration - update with your domain

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
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend routes (Next.js)
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
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/atlantic-leather /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Create deployment scripts directory
log "${YELLOW}Creating deployment scripts directory...${NC}"
mkdir -p /home/$SUDO_USER/deployment-scripts
chown -R $SUDO_USER:$SUDO_USER /home/$SUDO_USER/deployment-scripts

# Show installation summary
log "${GREEN}Server setup completed successfully!${NC}"
echo ""
log "${BLUE}Installation Summary:${NC}"
log "  ✅ Node.js $(node --version)"
log "  ✅ npm $(npm --version)"
log "  ✅ MySQL Server"
log "  ✅ Nginx"
log "  ✅ PM2"
log "  ✅ UFW Firewall"
log "  ✅ Certbot"
echo ""
log "${YELLOW}Next Steps:${NC}"
log "  1. Clone your repository to /var/www/altantis"
log "  2. Create MySQL database and user"
log "  3. Run the backend deployment script"
log "  4. Run the frontend deployment script"
log "  5. Update Nginx configuration with your domain"
log "  6. Setup SSL certificate with Certbot"
echo ""
log "${BLUE}Useful Commands:${NC}"
log "  Check services: systemctl status nginx mysql"
log "  View logs: journalctl -u nginx -f"
log "  MySQL: sudo mysql -u root -p"
log "  Nginx config: nano /etc/nginx/sites-available/atlantic-leather"
echo ""
log "${GREEN}Server is ready for deployment!${NC}"

exit 0
