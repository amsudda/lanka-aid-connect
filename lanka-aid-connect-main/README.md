# Lanka Aid Connect

A comprehensive disaster relief platform connecting donors with families affected by disasters in Sri Lanka.

## Overview

Lanka Aid Connect is a web-based platform designed to facilitate direct aid distribution to families and communities affected by natural disasters and emergencies in Sri Lanka. The platform enables victims to post their needs while allowing donors to browse, filter, and contribute items directly to those in need.

## Features

### For Victims/Requesters
- **Post Need Requests**: Create detailed posts with photos, location, and family composition
- **Track Donations**: Monitor donation progress in real-time
- **Secure Authentication**: Google OAuth or email/password sign-in
- **GPS Location**: Add precise location for aid delivery
- **Family Details**: Specify number of adults, children, and infants

### For Donors
- **Browse Needs**: View all active need posts with filters by category and district
- **Donate Items**: Pledge donations with proof of donation photos
- **Track Impact**: See donation history and families helped
- **WhatsApp Integration**: Direct communication with victims
- **Save Posts**: Bookmark posts for later

### Admin Features
- **Admin Dashboard**: Comprehensive statistics and monitoring
- **Post Verification**: Verify legitimate need posts with blue checkmark
- **User Management**: Manage users and verification status
- **Flag Management**: Review and resolve reported posts
- **Security**: Rate limiting, account lockout, IP logging

## Technology Stack

### Frontend
- **React** 18.3 with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Leaflet** for maps
- **date-fns** for date formatting
- **Sonner** for toast notifications

### Backend
- **Node.js** with Express.js
- **MySQL** database with Sequelize ORM
- **JWT** authentication
- **Passport.js** for OAuth
- **Multer** for file uploads
- **Sharp** for image processing
- **Helmet** for security headers
- **Express Rate Limit** for DDoS protection

## Installation

### Prerequisites
- Node.js 18+ and npm
- MySQL 8+
- Git

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd lanka-aid-connect-main

# Install dependencies
npm install

# Start development server (with HTTPS)
npm run dev

# Build for production
npm run build
```

The frontend will run on `https://localhost:8080`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Start server
npm start

# Development mode with auto-reload
npm run dev
```

The backend API will run on `http://localhost:5000`

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lanka_aid_connect
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://localhost:8080

# Optional: Admin IP whitelist (comma-separated)
ADMIN_ALLOWED_IPS=192.168.1.100,203.94.123.45
```

## Deployment

### Production Build

```bash
# Frontend
npm run build

# Backend - already production-ready
npm start
```

### Docker Deployment

The application is configured to run with Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Nginx Configuration

Nginx is used as a reverse proxy:
- Frontend: `/` → React app (port 8080)
- Backend API: `/api/` → Express server (port 5000)
- Uploads: `/uploads/` → Static files

## Project Structure

```
lanka-aid-connect-main/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   └── main.tsx          # Entry point
├── backend/               # Backend source code
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   └── config/       # Configuration files
│   └── uploads/          # Uploaded files
├── migrations/           # Database migrations
└── public/              # Static assets
```

## API Documentation

### Public Endpoints
- `GET /api/v1/posts` - List all need posts
- `GET /api/v1/posts/:id` - Get post details
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/google` - Google OAuth

### Protected Endpoints (Require JWT)
- `POST /api/v1/posts` - Create need post
- `POST /api/v1/donations` - Make donation
- `GET /api/v1/users/me` - Get current user
- `DELETE /api/v1/posts/:id` - Delete own post

### Admin Endpoints (Require Admin Role)
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/posts` - Manage all posts
- `PUT /api/v1/admin/posts/:id/status` - Update post status
- `GET /api/v1/admin/flags` - Review flagged posts
- `GET /api/v1/admin/users` - User management

## Security Features

- **Rate Limiting**: 5 login attempts per 15 minutes
- **Account Lockout**: 30-minute lockout after failed attempts
- **CSRF Protection**: Secure cookies and CORS configuration
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Security Headers**: Helmet.js configuration
- **Input Validation**: express-validator for all inputs
- **File Upload Security**: Multer with file type restrictions

## Analytics

The platform integrates with:
- **Microsoft Clarity** (ID: ue6ivmclpm) for user behavior analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team

## Acknowledgments

- Built to help Sri Lankan communities during disasters
- Inspired by the resilience of disaster-affected families
- Powered by the generosity of donors worldwide
