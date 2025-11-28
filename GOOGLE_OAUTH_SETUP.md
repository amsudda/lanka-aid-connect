# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it "Lanka Aid Connect" (or any name you prefer)

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Fill in the required information:
   - **App name**: Lanka Aid Connect
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
5. Add test users (your Gmail account for testing)
6. Save and continue

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: Lanka Aid Connect Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:8080`
     - `https://localhost:8080`
     - `http://localhost:5000`
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/v1/auth/google/callback`
     - `https://localhost:5000/api/v1/auth/google/callback`
5. Click **Create**

## Step 5: Copy Credentials

You'll see a dialog with your:
- **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
- **Client Secret** (random string)

## Step 6: Update Backend .env

Open `backend/.env` and update these values:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

Replace `your_client_id_here` and `your_client_secret_here` with the actual values from Step 5.

## Step 7: Restart Backend Server

```bash
cd backend
npm run dev
```

## Step 8: Test the Flow

1. Go to `https://localhost:8080/profile` (must be HTTPS for mobile)
2. Click "Sign in with Google"
3. You'll be redirected to Google login
4. After authorizing, you'll be redirected back to your profile page
5. Your profile should now be visible!

## Features Available After Login

### For Donors:
- ✅ View donation history
- ✅ Track impact (families helped, items donated)
- ✅ Earn badges for contributions
- ✅ Make donations to need posts

### For Victims/Requesters:
- ✅ Post aid requests with photos and location
- ✅ View their posted requests
- ✅ Track fulfillment status
- ✅ Edit or update their posts

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:5000/api/v1/auth/google/callback`
- Check for trailing slashes (don't add them)
- Ensure the port number matches your backend server port

### "Access Blocked" Error
- Add your email to test users in OAuth consent screen
- Make sure the app is in "Testing" mode during development

### Backend Not Receiving Callback
- Check that backend is running on port 5000
- Verify CORS is allowing your frontend URL
- Check backend logs for errors

## Production Deployment

For production, you'll need to:
1. Update redirect URIs with your production domain
2. Publish the OAuth consent screen (Google review required)
3. Update `GOOGLE_CALLBACK_URL` in production `.env`
4. Use HTTPS for all URLs

---

**Note**: Keep your Client Secret secure and never commit it to version control!
