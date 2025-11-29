# Lanka Aid Connect

Disaster relief coordination platform for Sri Lanka.

## Port Configuration

The application uses the following ports:

### Development / Local
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:5001
- **Database:** localhost:3306 (MySQL)

### Production Deployment

**Port Mappings:**
```
Frontend: 8080:80
Backend:  5001:5000
Database: 3306:3306 (internal only)
```

**For Coolify/VPS Deployment:**
- **Ports Exposes:** `8080,5001`
- **Ports Mappings:** `8080:80,5001:5000`

## Quick Start

### Using Docker (Single Container - Recommended for Production)

```bash
# Clone the repository
git clone https://github.com/amsudda/lanka-aid-connect.git
cd lanka-aid-connect

# Build the Docker image
docker build -t lanka-aid-connect .

# Run with environment variables
docker run -d \
  -p 8080:80 \
  -p 5001:5000 \
  -e DB_HOST=your_db_host \
  -e DB_NAME=LankaAid \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e JWT_SECRET=your_jwt_secret \
  -e GOOGLE_CLIENT_ID=your_google_client_id \
  -e GOOGLE_CLIENT_SECRET=your_google_secret \
  -e GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback \
  -e FRONTEND_URL=https://yourdomain.com \
  -e NODE_ENV=production \
  lanka-aid-connect

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:5001/api/v1
```

### Using Docker Compose (Alternative - Local Development)

```bash
# Clone the repository
git clone https://github.com/amsudda/lanka-aid-connect.git
cd lanka-aid-connect

# Create .env file from example
cp .env.example .env

# Edit .env with your configuration
# Update GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, etc.

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:5001/api/v1
```

### Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file
npm run dev
```

#### Frontend
```bash
cd lanka-aid-connect-main
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables:
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL
- `JWT_SECRET` - Secret for JWT tokens
- `SESSION_SECRET` - Secret for sessions
- `FRONTEND_URL` - Frontend URL (for CORS)
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database configuration

## Deployment

### Coolify/VPS Deployment

1. **Base Directory:** `/` (root)
2. **Build Pack:** `Dockerfile`
3. **Dockerfile Location:** `./Dockerfile`
4. **Ports Exposes:** `8080,5001`
5. **Ports Mappings:** `8080:80,5001:5000`
6. Set all environment variables in the platform
7. Deploy!

**Note:** The single Dockerfile builds and runs both frontend (Nginx on port 80) and backend (Node.js on port 5000) using supervisord as a process manager.

### Update Google OAuth Callback

Make sure to update your Google OAuth callback URL in Google Cloud Console:
```
https://yourdomain.com/api/v1/auth/google/callback
```

## Admin Access

**Admin Login:** `/admin/login`
**Admin Email:** Set in environment or use setup script

To create admin user:
```bash
cd backend
node src/scripts/createAdmin.js
```

Default credentials will be displayed in console.

## Features

- Disaster relief post creation with image/voice uploads
- Interactive map location picker
- Real-time notifications
- Admin panel for post verification
- User verification system
- Post flagging and moderation
- Google OAuth authentication
- Mobile-responsive design

## Tech Stack

**Backend:**
- Node.js + Express
- MySQL + Sequelize ORM
- Passport.js (Google OAuth)
- JWT Authentication

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Leaflet (Maps)

## License

MIT
