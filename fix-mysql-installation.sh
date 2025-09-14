#!/bin/bash

# Fix MySQL Installation Script
# This script handles MySQL installation issues on low-memory VPS instances

set -e

echo "🔧 Fixing MySQL Installation..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check available memory
MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
MEMORY_MB=$((MEMORY_KB / 1024))

echo -e "${BLUE}Available Memory: ${MEMORY_MB}MB${NC}"

if [ $MEMORY_MB -lt 1024 ]; then
    echo -e "${YELLOW}Warning: Low memory detected. Using MariaDB instead of MySQL.${NC}"
    USE_MARIADB=true
else
    echo -e "${GREEN}Sufficient memory for MySQL.${NC}"
    USE_MARIADB=false
fi

# Clean up failed MySQL installation
echo -e "${YELLOW}Cleaning up failed MySQL installation...${NC}"
apt-get remove --purge -y mysql-server mysql-server-8.0 mysql-client mysql-common mysql-server-core-8.0 mysql-client-core-8.0
apt-get autoremove -y
apt-get autoclean
rm -rf /var/lib/mysql
rm -rf /var/log/mysql
rm -rf /etc/mysql

if [ "$USE_MARIADB" = true ]; then
    echo -e "${YELLOW}Installing MariaDB (MySQL-compatible, lower memory usage)...${NC}"
    
    # Install MariaDB
    apt update
    apt install -y mariadb-server mariadb-client
    
    # Start and enable MariaDB
    systemctl start mariadb
    systemctl enable mariadb
    
    # Wait for MariaDB to start
    sleep 5
    
    # Secure MariaDB installation
    echo -e "${YELLOW}Securing MariaDB installation...${NC}"
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'temp_root_password';"
    mysql -e "DELETE FROM mysql.user WHERE User='';"
    mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    mysql -e "DROP DATABASE IF EXISTS test;"
    mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    mysql -e "FLUSH PRIVILEGES;"
    
    echo -e "${GREEN}MariaDB installation completed!${NC}"
    
else
    echo -e "${YELLOW}Installing MySQL with optimized configuration...${NC}"
    
    # Create MySQL configuration for low memory
    mkdir -p /etc/mysql/conf.d
    cat > /etc/mysql/conf.d/low-memory.cnf << 'EOF'
[mysqld]
# Low memory configuration
innodb_buffer_pool_size = 64M
innodb_log_file_size = 16M
innodb_log_buffer_size = 8M
key_buffer_size = 16M
max_connections = 50
query_cache_size = 16M
query_cache_limit = 1M
tmp_table_size = 16M
max_heap_table_size = 16M
thread_cache_size = 4
table_open_cache = 64
EOF
    
    # Install MySQL
    apt update
    apt install -y mysql-server
    
    # Start MySQL
    systemctl start mysql
    systemctl enable mysql
    
    # Wait for MySQL to start
    sleep 10
    
    # Secure MySQL installation
    echo -e "${YELLOW}Securing MySQL installation...${NC}"
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'temp_root_password';"
    mysql -e "DELETE FROM mysql.user WHERE User='';"
    mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    mysql -e "DROP DATABASE IF EXISTS test;"
    mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    mysql -e "FLUSH PRIVILEGES;"
    
    echo -e "${GREEN}MySQL installation completed!${NC}"
fi

# Create Atlantic Leather database and user
echo -e "${YELLOW}Creating Atlantic Leather database and user...${NC}"

DB_PASSWORD="AtlanticLeather2024!"
mysql -u root -ptemp_root_password -e "CREATE DATABASE IF NOT EXISTS atlantic_leather_db;"
mysql -u root -ptemp_root_password -e "CREATE USER IF NOT EXISTS 'atlantic_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -u root -ptemp_root_password -e "GRANT ALL PRIVILEGES ON atlantic_leather_db.* TO 'atlantic_user'@'localhost';"
mysql -u root -ptemp_root_password -e "FLUSH PRIVILEGES;"

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
mysql -u atlantic_user -p$DB_PASSWORD -e "SHOW DATABASES;" atlantic_leather_db

echo ""
echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Database Information:${NC}"
echo "Database Name: atlantic_leather_db"
echo "Database User: atlantic_user"
echo "Database Password: $DB_PASSWORD"
echo "Root Password: temp_root_password"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update your backend .env file with:"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "2. Continue with the deployment script"
echo "3. Or run: npm run setup (in backend directory)"
