# Coolify Persistent Storage Configuration

## Problem

The Lanka Aid Connect application stores uploaded files (images, voice notes) in the `/app/backend/uploads/` directory inside the Docker container. Without persistent storage configured, these files are lost when:
- The container is redeployed
- The container is restarted
- The application is scaled

## Solution

Configure Coolify to mount a persistent volume for the uploads directory.

## Steps to Configure in Coolify

### 1. Navigate to Your Application

1. Log in to your Coolify dashboard
2. Go to your Lanka Aid Connect application

### 2. Configure Persistent Storage

1. Click on **"Storages"** or **"Volumes"** tab
2. Click **"Add Storage"** or **"New Volume"**
3. Configure the volume:
   - **Name**: `uploads-storage` (or any descriptive name)
   - **Source/Host Path**: Choose a persistent location on your server (e.g., `/var/lib/coolify/storage/lanka-aid-uploads`)
   - **Destination/Container Path**: `/app/backend/uploads`
   - **Mode**: `rw` (read-write)

### 3. Redeploy

After adding the volume, redeploy your application for the changes to take effect.

## Verification

After redeploying with persistent storage:

1. Create a test post with images
2. Verify images load correctly
3. Redeploy the application
4. Verify the same images still load (they should persist now)

## Alternative: Using Environment Variable

If you prefer to use a custom upload path:

1. Set environment variable: `UPLOAD_PATH=/app/data/uploads`
2. Mount volume: `/your/host/path` → `/app/data/uploads`

## Troubleshooting

### Images still not loading after configuration

1. **Check logs** for upload directory errors:
   ```bash
   # Look for these log messages in deployment logs:
   📁 Upload directory configuration:
   📁 Upload base path: ./uploads
   📁 Resolved upload path: /app/backend/uploads
   ```

2. **Verify volume is mounted**:
   - In Coolify, check the "Storages" tab shows the volume as mounted
   - Container path should be `/app/backend/uploads`

3. **Check file permissions**:
   - The uploads directory needs write permissions for the Node.js process
   - Container runs as `root` by default, so this shouldn't be an issue

### Voice notes work but images don't

This indicates a file saving or path issue rather than persistent storage:

1. Check deployment logs for:
   ```
   💾 Saving images to: /app/backend/uploads/posts
   💾 Generated filename: [uuid].jpg for field: images
   📷 Image 1: { filename: '...', path: '...', url: '/uploads/posts/...' }
   ```

2. If you see "No image files to process", the frontend isn't sending images correctly

3. If you see file save logs but images don't load, check browser console for:
   - 404 errors (file not found)
   - CORS errors
   - Image load errors

## Expected Behavior

✅ **With persistent storage**:
- Files uploaded during runtime persist across deployments
- Images load correctly after container restarts
- Uploads directory grows over time (may need cleanup strategy)

❌ **Without persistent storage**:
- Files appear to upload successfully
- Files load immediately after upload
- Files disappear after redeploy/restart
- Database has image records but files are missing

## Cleanup Strategy (Optional)

Consider implementing a cleanup strategy for old uploads to manage disk space:

1. Delete uploads for deleted posts
2. Archive uploads older than X months
3. Implement file size limits
4. Monitor disk usage

This can be implemented as a scheduled job or maintenance script.
