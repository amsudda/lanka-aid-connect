# CRITICAL: Persistent Storage Setup for Coolify

## The Problem You're Experiencing

✅ Posts are being created successfully
✅ Images ARE being uploaded to the server
❌ Images disappear after redeployment or don't show up

**Why?** Images are saved to `/app/backend/uploads/` inside the Docker container, which is **ephemeral storage**. Every time you redeploy, the container is recreated and all files inside are deleted.

## The Solution: Configure Persistent Storage in Coolify

Follow these exact steps:

### Step 1: Log in to Coolify
Go to your Coolify dashboard at your server URL.

### Step 2: Navigate to Your Application
1. Click on **"Resources"** in the sidebar
2. Find and click on **"lanka-aid-connect"** application

### Step 3: Go to Storages Tab
1. Click on the **"Storages"** tab (should be near "Environment Variables")
2. Click **"Add"** or **"New Storage"** button

### Step 4: Configure the Persistent Volume

Fill in these exact values:

```
Name: uploads-storage
Description: Persistent storage for uploaded images and files
Source Path (Host): /data/coolify/lanka-aid-uploads
Destination Path (Container): /app/backend/uploads
```

**Important Notes:**
- **Source Path**: This is where files will be stored on your VPS server (persistent)
- **Destination Path**: Must be EXACTLY `/app/backend/uploads` (where the backend saves files)
- Make sure "Mount as Volume" or similar option is selected

### Step 5: Save and Redeploy
1. Click **"Save"** or **"Add Storage"**
2. Click **"Redeploy"** button to restart with the new volume

### Step 6: Verify It Works

After redeployment:

1. **Create a test post** with an image
2. **Check if the image loads** on the post card/detail page
3. **Redeploy again** (to verify persistence)
4. **Check if the same image still loads** - it should! ✅

## What This Does

**Before (Current - BAD):**
```
Docker Container (gets deleted on redeploy)
└── /app/backend/uploads/
    └── posts/
        └── image.jpg  ← DELETED ON REDEPLOY ❌
```

**After (With Persistent Storage - GOOD):**
```
VPS Server (permanent storage)
└── /data/coolify/lanka-aid-uploads/
    └── posts/
        └── image.jpg  ← SURVIVES REDEPLOYS ✅
          ↕
    Mounted to container as:
    /app/backend/uploads/
```

## Alternative: Using Coolify UI Screenshots

If the above fields look different in your Coolify version:

1. Look for **"Volumes"** or **"Persistent Storage"** section
2. Create a new volume with:
   - **Container path**: `/app/backend/uploads`
   - **Host path**: Any path on your server (e.g., `/var/lib/coolify/storage/lanka-aid-uploads`)
   - **Mode**: Read-Write (rw)

## Troubleshooting

### Images still not showing after adding volume?

1. **Check the volume is mounted:**
   - Go to Coolify → Your App → Storages
   - Verify the storage appears in the list
   - Container path should be `/app/backend/uploads`

2. **Check backend logs:**
   - Look for these logs on startup:
   ```
   📁 Upload directory configuration:
   📁 Upload base path: ./uploads
   📁 Resolved upload path: /app/backend/uploads
   ```

3. **SSH into your VPS and check:**
   ```bash
   # Check if directory exists
   ls -la /data/coolify/lanka-aid-uploads/

   # Should show:
   posts/
   voice-notes/
   avatars/
   ```

4. **Create a test post and check again:**
   ```bash
   ls -la /data/coolify/lanka-aid-uploads/posts/
   # Should show image files like: abc-123-456.jpg
   ```

### Images exist on server but don't load in browser?

This is a different issue - likely Nginx proxy configuration. Check:
- Browser console for 404 errors
- Nginx is correctly proxying `/uploads/` to backend

## Summary

**YOU MUST configure persistent storage in Coolify for images to survive redeployments.**

Without this, every deployment deletes all uploaded files. This is the #1 cause of "images not showing" issues with Docker deployments.
