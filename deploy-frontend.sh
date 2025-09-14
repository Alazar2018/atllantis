#!/bin/bash

# Atlantic Leather Frontend Deployment Script
# Run this script on your VPS server after backend deployment

set -e  # Exit on any error

echo "🚀 Starting Atlantic Leather Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/altantis"
FRONTEND_DIR="$PROJECT_DIR"
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

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    log "${RED}Project directory $PROJECT_DIR does not exist. Please clone the repository first.${NC}"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log "${RED}package.json not found in $PROJECT_DIR${NC}"
    exit 1
fi

log "${GREEN}Prerequisites check passed!${NC}"

# Install dependencies
log "${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Check if .env.local file exists
if [ ! -f ".env.local" ]; then
    log "${YELLOW}Creating .env.local file from template...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env.local
        log "${YELLOW}Please edit .env.local file with your production configuration:${NC}"
        log "${YELLOW}nano $PROJECT_DIR/.env.local${NC}"
        log "${YELLOW}Make sure to update NEXT_PUBLIC_API_URL with your domain${NC}"
        log "${YELLOW}Press Enter to continue after editing the .env.local file...${NC}"
        read -r
    else
        log "${RED}env.example file not found. Please create .env.local file manually.${NC}"
        exit 1
    fi
fi

# Build the application
log "${YELLOW}Building Next.js application...${NC}"
if npm run build; then
    log "${GREEN}Build completed successfully!${NC}"
else
    log "${RED}Build failed. Please check the error messages above.${NC}"
    exit 1
fi

# Stop existing PM2 processes
log "${YELLOW}Stopping existing frontend PM2 processes...${NC}"
pm2 stop atlantic-frontend 2>/dev/null || true
pm2 delete atlantic-frontend 2>/dev/null || true

# Start frontend with PM2
log "${YELLOW}Starting frontend with PM2...${NC}"
pm2 start npm --name "atlantic-frontend" -- start

# Save PM2 configuration
pm2 save

# Wait a moment for the service to start
sleep 10

# Check if frontend is running
if pm2 list | grep -q "atlantic-frontend.*online"; then
    log "${GREEN}Frontend is running successfully!${NC}"
    
    # Test frontend endpoint
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log "${GREEN}Frontend health check passed!${NC}"
    else
        log "${YELLOW}Frontend health check failed, but service is running. Check logs with: pm2 logs atlantic-frontend${NC}"
    fi
else
    log "${RED}Frontend failed to start. Check logs with: pm2 logs atlantic-frontend${NC}"
    exit 1
fi

# Show PM2 status
log "${YELLOW}PM2 Status:${NC}"
pm2 status

# Show useful commands
log "${GREEN}Frontend deployment completed successfully!${NC}"
log "${YELLOW}Useful commands:${NC}"
log "  View logs: pm2 logs atlantic-frontend"
log "  Restart: pm2 restart atlantic-frontend"
log "  Stop: pm2 stop atlantic-frontend"
log "  Status: pm2 status"
log "  Monitor: pm2 monit"

log "${GREEN}Frontend is now running on port 3000!${NC}"
log "${YELLOW}Next steps:${NC}"
log "  1. Configure Nginx reverse proxy (if not done already)"
log "  2. Setup SSL certificate"
log "  3. Test the complete application"
log "  4. Configure monitoring and backups"

log "${GREEN}Both backend and frontend are now deployed!${NC}"
log "${YELLOW}Your application should be accessible at:${NC}"
log "  Backend API: http://localhost:3001"
log "  Frontend: http://localhost:3000"
log "  Health check: http://localhost:3001/health"

exit 0
