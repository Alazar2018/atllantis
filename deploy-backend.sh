#!/bin/bash

# Atlantic Leather Backend Deployment Script
# Run this script on your VPS server

set -e  # Exit on any error

echo "🚀 Starting Atlantic Leather Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/altantis"
BACKEND_DIR="$PROJECT_DIR/backend"
LOG_FILE="/var/log/atlantic-deployment.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    log "${RED}This script should not be run as root. Please run as a regular user with sudo privileges.${NC}"
    exit 1
fi

# Check prerequisites
log "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
    log "${RED}Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    log "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

if ! command_exists pm2; then
    log "${RED}PM2 is not installed. Installing PM2 globally...${NC}"
    sudo npm install -g pm2
fi

if ! command_exists mysql; then
    log "${RED}MySQL is not installed. Please install MySQL first.${NC}"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    log "${RED}Project directory $PROJECT_DIR does not exist. Please clone the repository first.${NC}"
    exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log "${RED}package.json not found in $BACKEND_DIR${NC}"
    exit 1
fi

log "${GREEN}Prerequisites check passed!${NC}"

# Install dependencies
log "${YELLOW}Installing backend dependencies...${NC}"
npm install --production

# Check if .env file exists
if [ ! -f ".env" ]; then
    log "${YELLOW}Creating .env file from template...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        log "${YELLOW}Please edit .env file with your production configuration:${NC}"
        log "${YELLOW}nano $BACKEND_DIR/.env${NC}"
        log "${YELLOW}Press Enter to continue after editing the .env file...${NC}"
        read -r
    else
        log "${RED}env.example file not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Test database connection
log "${YELLOW}Testing database connection...${NC}"
if npm run test:db; then
    log "${GREEN}Database connection successful!${NC}"
else
    log "${RED}Database connection failed. Please check your database configuration.${NC}"
    exit 1
fi

# Setup database
log "${YELLOW}Setting up database...${NC}"
if npm run setup; then
    log "${GREEN}Database setup completed!${NC}"
else
    log "${RED}Database setup failed. Please check your database configuration and permissions.${NC}"
    exit 1
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    log "${YELLOW}Creating uploads directory...${NC}"
    mkdir -p uploads
    chmod 755 uploads
fi

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Stop existing PM2 processes
log "${YELLOW}Stopping existing PM2 processes...${NC}"
pm2 stop atlantic-backend 2>/dev/null || true
pm2 delete atlantic-backend 2>/dev/null || true

# Start backend with PM2
log "${YELLOW}Starting backend with PM2...${NC}"
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start server.js --name "atlantic-backend" --env production
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup | grep -E '^sudo' | bash

# Wait a moment for the service to start
sleep 5

# Check if backend is running
if pm2 list | grep -q "atlantic-backend.*online"; then
    log "${GREEN}Backend is running successfully!${NC}"
    
    # Test health endpoint
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log "${GREEN}Health check passed!${NC}"
    else
        log "${YELLOW}Health check failed, but service is running. Check logs with: pm2 logs atlantic-backend${NC}"
    fi
else
    log "${RED}Backend failed to start. Check logs with: pm2 logs atlantic-backend${NC}"
    exit 1
fi

# Show PM2 status
log "${YELLOW}PM2 Status:${NC}"
pm2 status

# Show useful commands
log "${GREEN}Deployment completed successfully!${NC}"
log "${YELLOW}Useful commands:${NC}"
log "  View logs: pm2 logs atlantic-backend"
log "  Restart: pm2 restart atlantic-backend"
log "  Stop: pm2 stop atlantic-backend"
log "  Status: pm2 status"
log "  Monitor: pm2 monit"

log "${GREEN}Backend is now running on port 3001!${NC}"
log "${YELLOW}Next steps:${NC}"
log "  1. Configure Nginx reverse proxy"
log "  2. Deploy frontend"
log "  3. Setup SSL certificate"
log "  4. Configure firewall"

exit 0
