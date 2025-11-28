# VPS PostgreSQL Setup Commands

Run these commands **on your VPS** via SSH to set up the database:

## Quick Setup (Copy & Paste All at Once)

```bash
# Switch to postgres user and run setup
sudo -u postgres psql << EOF
-- Create user
CREATE USER lankaaid WITH PASSWORD '#Lankaaid#2025';
ALTER USER lankaaid CREATEDB;

-- Create database
CREATE DATABASE lanka_aid_connect OWNER lankaaid;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lanka_aid_connect TO lankaaid;

-- Show confirmation
\du lankaaid
\l lanka_aid_connect
EOF
```

## Configure Remote Access

### 1. Edit PostgreSQL Configuration

```bash
# Find PostgreSQL version and config location
sudo -u postgres psql -c "SHOW config_file;"

# Edit postgresql.conf (adjust path based on your version)
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Find and change:
```
listen_addresses = '*'
```

Save and exit (Ctrl+X, then Y, then Enter)

### 2. Edit Client Authentication

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Add this line at the **end** of the file:
```
host    all             all             0.0.0.0/0               md5
```

Save and exit (Ctrl+X, then Y, then Enter)

### 3. Restart PostgreSQL

```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### 4. Open Firewall

```bash
sudo ufw allow 5432/tcp
sudo ufw status
```

## Verify Setup

```bash
# Check if user exists
sudo -u postgres psql -c "\du lankaaid"

# Check if database exists
sudo -u postgres psql -c "\l lanka_aid_connect"

# Test local connection
sudo -u postgres psql -U lankaaid -d lanka_aid_connect -c "SELECT current_database(), current_user;"

# Show server IP
hostname -I
```

## Alternative: Use the Automated Script

Or download and run the automated setup script:

```bash
# Download the script (if you have it on your VPS)
chmod +x setup-vps-database.sh
./setup-vps-database.sh
```

## Troubleshooting

### If PostgreSQL won't start

```bash
# Check logs
sudo journalctl -u postgresql -n 50

# Check status
sudo systemctl status postgresql

# Try restarting
sudo systemctl restart postgresql
```

### If you get permission errors

```bash
# Make sure postgres user owns data directory
sudo chown -R postgres:postgres /var/lib/postgresql
```

### To reset everything and start over

```bash
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS lanka_aid_connect;
DROP USER IF EXISTS lankaaid;
EOF
```

Then run the Quick Setup commands again.

## Test from Local Machine

After completing the VPS setup, test from your local machine:

```bash
cd backend
npm run test:connection
```

You should see:
```
✅ Successfully connected to PostgreSQL database!
```

## Next Steps

Once connection is successful:

1. Run migrations: `npm run db:migrate`
2. Seed data: `npm run db:seed`
3. Start server: `npm run dev`
