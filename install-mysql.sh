#!/bin/bash

# MySQL Installation Script for Atlantic Leather
# Run this script if MySQL is not installed on your server

set -e

echo "🐬 Installing MySQL for Atlantic Leather..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if MySQL is already installed
if command -v mysql >/dev/null 2>&1; then
    echo -e "${YELLOW}MySQL is already installed. Checking status...${NC}"
    systemctl status mysql --no-pager -l
    exit 0
fi

echo -e "${YELLOW}Installing MySQL Server...${NC}"

# Update package list
apt update

# Install MySQL Server
apt install -y mysql-server

# Start and enable MySQL
systemctl start mysql
systemctl enable mysql

# Wait for MySQL to start
sleep 5

echo -e "${GREEN}MySQL installation completed!${NC}"

# Secure MySQL installation
echo -e "${YELLOW}Securing MySQL installation...${NC}"

# Set root password
ROOT_PASSWORD="AtlanticLeather2024!"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$ROOT_PASSWORD';"

# Remove anonymous users
mysql -u root -p$ROOT_PASSWORD -e "DELETE FROM mysql.user WHERE User='';"

# Remove remote root access
mysql -u root -p$ROOT_PASSWORD -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"

# Remove test database
mysql -u root -p$ROOT_PASSWORD -e "DROP DATABASE IF EXISTS test;"
mysql -u root -p$ROOT_PASSWORD -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"

# Reload privileges
mysql -u root -p$ROOT_PASSWORD -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}MySQL security configuration completed!${NC}"

# Create Atlantic Leather database and user
echo -e "${YELLOW}Creating Atlantic Leather database and user...${NC}"

DB_PASSWORD="AtlanticLeather2024!"
mysql -u root -p$ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS atlantic_leather_db;"
mysql -u root -p$ROOT_PASSWORD -e "CREATE USER IF NOT EXISTS 'atlantic_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -u root -p$ROOT_PASSWORD -e "GRANT ALL PRIVILEGES ON atlantic_leather_db.* TO 'atlantic_user'@'localhost';"
mysql -u root -p$ROOT_PASSWORD -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}Database and user created successfully!${NC}"

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
mysql -u atlantic_user -p$DB_PASSWORD -e "SHOW DATABASES;" atlantic_leather_db

echo ""
echo -e "${GREEN}🎉 MySQL setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Database Information:${NC}"
echo "Database Name: atlantic_leather_db"
echo "Database User: atlantic_user"
echo "Database Password: $DB_PASSWORD"
echo "Root Password: $ROOT_PASSWORD"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "1. Save these passwords securely"
echo "2. Update your .env file with these credentials"
echo "3. You can now run the backend deployment script"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update your backend .env file with:"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "2. Run: npm run setup (in backend directory)"
echo "3. Start your backend with PM2"
