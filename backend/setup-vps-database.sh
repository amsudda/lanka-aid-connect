#!/bin/bash

# Lanka Aid Connect - PostgreSQL Setup Script for VPS
# Run this script on your VPS to set up the database

set -e  # Exit on any error

echo "🚀 Lanka Aid Connect - Database Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DB_NAME="lanka_aid_connect"
DB_USER="lankaaid"
DB_PASSWORD="#Lankaaid#2025"

echo "📋 Configuration:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Install it with: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting...${NC}"
    sudo systemctl start postgresql
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Create user if doesn't exist
echo ""
echo "👤 Setting up database user..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

echo -e "${GREEN}✅ User '$DB_USER' exists${NC}"

# Grant privileges
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;" # Optional: remove this for production

# Create database if doesn't exist
echo ""
echo "💾 Setting up database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    sudo -u postgres createdb -O $DB_USER $DB_NAME

echo -e "${GREEN}✅ Database '$DB_NAME' exists${NC}"

# Grant all privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Configure PostgreSQL for remote connections
echo ""
echo "🌐 Configuring remote access..."

PG_CONF=$(sudo -u postgres psql -t -P format=unaligned -c 'SHOW config_file')
PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c "SELECT setting FROM pg_settings WHERE name='hba_file'")

echo "   Config file: $PG_CONF"
echo "   HBA file: $PG_HBA"

# Backup original files
sudo cp "$PG_CONF" "${PG_CONF}.backup.$(date +%Y%m%d)" 2>/dev/null || true
sudo cp "$PG_HBA" "${PG_HBA}.backup.$(date +%Y%m%d)" 2>/dev/null || true

# Update postgresql.conf
if ! sudo grep -q "^listen_addresses = '\*'" "$PG_CONF"; then
    echo "   Updating listen_addresses..."
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
    sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
fi

# Update pg_hba.conf
if ! sudo grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
    echo "   Adding remote access rule..."
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$PG_HBA" > /dev/null
fi

echo -e "${GREEN}✅ Remote access configured${NC}"

# Configure firewall
echo ""
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 5432/tcp
    echo -e "${GREEN}✅ Firewall rule added${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not found, skipping firewall configuration${NC}"
fi

# Restart PostgreSQL
echo ""
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Wait for PostgreSQL to start
sleep 2

if sudo systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL restarted successfully${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to restart${NC}"
    sudo systemctl status postgresql
    exit 1
fi

# Test connection
echo ""
echo "🧪 Testing connection..."
if sudo -u postgres psql -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection test successful${NC}"
else
    echo -e "${RED}❌ Connection test failed${NC}"
    exit 1
fi

# Display connection info
echo ""
echo "======================================"
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "======================================"
echo ""
echo "📋 Connection Details:"
echo "   Host: $(hostname -I | awk '{print $1}')"
echo "   Port: 5432"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🔐 Security Notes:"
echo "   1. Change the password in production"
echo "   2. Restrict IP access in pg_hba.conf"
echo "   3. Use SSL for production connections"
echo ""
echo "📝 Next steps:"
echo "   1. Test connection from your local machine:"
echo "      npm run test:connection"
echo "   2. Run migrations:"
echo "      npm run db:migrate"
echo "   3. Seed data (optional):"
echo "      npm run db:seed"
echo ""
