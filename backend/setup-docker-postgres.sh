#!/bin/bash

# Find PostgreSQL container
POSTGRES_CONTAINER=$(docker ps --filter "ancestor=postgres" --format "{{.Names}}" | head -1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo "❌ No PostgreSQL container found"
    echo "Finding all running containers:"
    docker ps
    exit 1
fi

echo "✅ Found PostgreSQL container: $POSTGRES_CONTAINER"
echo ""
echo "Creating user and setting up database..."

docker exec -i $POSTGRES_CONTAINER psql -U postgres << 'EOF'
-- Check if user exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'lankaaid') THEN
        CREATE USER lankaaid WITH PASSWORD '#Lankaaid#2025';
        RAISE NOTICE 'User lankaaid created';
    ELSE
        ALTER USER lankaaid WITH PASSWORD '#Lankaaid#2025';
        RAISE NOTICE 'User lankaaid password updated';
    END IF;
END
$$;

-- Grant privileges
ALTER USER lankaaid WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE "LankaaidDB" TO lankaaid;

-- Show user info
\du lankaaid

-- Show database info
\l LankaaidDB
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now test connection from your local machine:"
echo "  cd backend"
echo "  npm run test:connection"
