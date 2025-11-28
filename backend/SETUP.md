# Lanka Aid Connect Backend - Setup Guide

## Database Configuration

Your PostgreSQL database is hosted on a VPS with the following credentials:

- **Host**: 31.97.116.89
- **Port**: 5432
- **Username**: lankaaid
- **Database Name**: lanka_aid_connect

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Test Database Connection

First, verify that you can connect to the PostgreSQL database:

```bash
npm run test:connection
```

This will:
- Test the connection to your VPS database
- Show the PostgreSQL version
- List available databases

### 3. Create Database (if needed)

If the database doesn't exist, create it:

```bash
npm run db:setup
```

This will create the `lanka_aid_connect` database on your VPS.

### 4. Run Migrations

Create all the required tables:

```bash
npm run db:migrate
```

This will create:
- users
- donor_profiles
- need_posts
- post_images
- donations
- emergency_centers
- post_flags

### 5. Seed Sample Data (Optional)

Add sample data for testing:

```bash
npm run db:seed
```

This adds:
- 3 emergency centers
- 4 sample need posts

### 6. Configure Google OAuth (Optional)

For user authentication, you'll need Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/v1/auth/google/callback`
6. Update `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### 7. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at: `http://localhost:5000`

## Testing the API

Once the server is running, test it:

1. **Health Check**:
   ```bash
   curl http://localhost:5000/api/v1/health
   ```

2. **Get All Posts**:
   ```bash
   curl http://localhost:5000/api/v1/posts
   ```

3. **Get Stats**:
   ```bash
   curl http://localhost:5000/api/v1/posts/stats
   ```

## Troubleshooting

### Connection Issues

If you can't connect to the database, check:

1. **VPS PostgreSQL Configuration** (`postgresql.conf`):
   ```
   listen_addresses = '*'
   ```

2. **Allow Remote Connections** (`pg_hba.conf`):
   ```
   # Add this line:
   host    all             all             0.0.0.0/0               md5
   ```

3. **Firewall**:
   ```bash
   # On VPS, allow port 5432
   sudo ufw allow 5432/tcp
   ```

4. **PostgreSQL Service**:
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql

   # Restart if needed
   sudo systemctl restart postgresql
   ```

### Permission Issues

If the user can't create databases:

```sql
-- Connect to VPS as postgres superuser and run:
ALTER USER lankaaid CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE lanka_aid_connect TO lankaaid;
```

### Common Errors

**Error: `ECONNREFUSED`**
- PostgreSQL is not running or firewall is blocking

**Error: `28P01` (Authentication failed)**
- Check username/password in `.env` file

**Error: `3D000` (Database does not exist)**
- Run `npm run db:setup` to create the database

**Error: `42501` (Permission denied)**
- User needs CREATEDB privilege (see Permission Issues above)

## Environment Variables

Make sure your `.env` file is configured:

```env
# Database (VPS)
DB_HOST=31.97.116.89
DB_PORT=5432
DB_NAME=lanka_aid_connect
DB_USER=lankaaid
DB_PASSWORD=#Lankaaid#2025

# JWT (Change these in production!)
JWT_SECRET=your_super_secret_key
SESSION_SECRET=your_session_secret

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Next Steps

1. Update the frontend to use this backend API
2. Set up Google OAuth for authentication
3. Configure production environment variables
4. Set up SSL/HTTPS for production
5. Configure a reverse proxy (Nginx) on the VPS

## API Documentation

Full API documentation is available in `README.md`

Key endpoints:
- `GET /api/v1/posts` - Get all need posts
- `POST /api/v1/posts` - Create new post
- `POST /api/v1/posts/:id/donate` - Create donation
- `GET /api/v1/centers` - Get emergency centers
- `GET /api/v1/auth/google` - Google OAuth login
