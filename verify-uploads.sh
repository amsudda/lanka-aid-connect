#!/bin/bash

# Verification script for persistent uploads storage
# Run this on your VPS to verify storage is configured correctly

echo "🔍 Verifying uploads storage configuration..."
echo ""

# Check if uploads directory exists on host
if [ -d "/data/coolify/uploads" ]; then
    echo "✅ Host directory exists: /data/coolify/uploads"
    echo "📊 Permissions: $(ls -ld /data/coolify/uploads | awk '{print $1}')"
    echo "📊 Owner: $(ls -ld /data/coolify/uploads | awk '{print $3":"$4}')"
else
    echo "❌ Host directory NOT found: /data/coolify/uploads"
    echo "Creating directory..."
    mkdir -p /data/coolify/uploads
    chmod 777 /data/coolify/uploads
    echo "✅ Directory created"
fi

echo ""

# Check if container is running
CONTAINER_ID=$(docker ps | grep lanka-aid | awk '{print $1}' | head -n 1)

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Lanka Aid container not running"
    exit 1
fi

echo "✅ Container found: $CONTAINER_ID"
echo ""

# Check if volume is mounted
echo "🔍 Checking volume mounts..."
docker inspect $CONTAINER_ID | grep -A 5 "Mounts"

echo ""

# Test write to uploads directory
echo "🔍 Testing write permissions..."
docker exec $CONTAINER_ID sh -c "echo 'test' > /usr/share/nginx/html/uploads/test.txt && cat /usr/share/nginx/html/uploads/test.txt"

if [ $? -eq 0 ]; then
    echo "✅ Write test successful"

    # Check if file exists on host
    if [ -f "/data/coolify/uploads/test.txt" ]; then
        echo "✅ File persisted to host storage"
        rm /data/coolify/uploads/test.txt
    else
        echo "❌ File NOT persisted to host storage"
        echo "⚠️  Volume mount may not be configured correctly"
    fi
else
    echo "❌ Write test failed - check permissions"
fi

echo ""
echo "📊 Current uploads:"
ls -lh /data/coolify/uploads 2>/dev/null || echo "Directory empty or not accessible"
