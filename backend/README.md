# Lanka Aid Connect - Backend API

Backend API for Lanka Aid Connect, a disaster relief coordination platform for Sri Lanka.

## Features

- **Need Posts Management**: Create, read, update, and delete disaster relief need posts
- **Donations Tracking**: Track donations and update post fulfillment status
- **Emergency Centers**: Manage verified emergency relief centers
- **User Authentication**: Google OAuth integration with JWT tokens
- **Donor Profiles**: Track donor statistics, badges, and donation history
- **Image Uploads**: Support for multiple images per post
- **Content Moderation**: Flag and report inappropriate posts
- **Search & Filtering**: Search posts by category, district, and keywords

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: Passport.js (Google OAuth 2.0, JWT)
- **File Upload**: Multer + Sharp
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs

## Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 13.x
- Google OAuth credentials

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
   - Database credentials
   - JWT secret
   - Google OAuth credentials
   - Other configuration options

5. Create the PostgreSQL database:
```bash
createdb lanka_aid_connect
```

6. Run database migrations:
```bash
npm run db:migrate
```

7. (Optional) Seed the database with sample data:
```bash
npm run db:seed
```

## Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `GET /api/v1/auth/google` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `GET /api/v1/auth/me` - Get current user (protected)
- `PUT /api/v1/auth/profile` - Update user profile (protected)
- `POST /api/v1/auth/logout` - Logout

### Need Posts
- `GET /api/v1/posts` - Get all need posts (with filtering)
- `GET /api/v1/posts/stats` - Get platform statistics
- `GET /api/v1/posts/:id` - Get single need post
- `POST /api/v1/posts` - Create new need post (with image upload)
- `PUT /api/v1/posts/:id` - Update need post (requires PIN)
- `DELETE /api/v1/posts/:id` - Delete need post (requires PIN)

### Donations
- `POST /api/v1/posts/:id/donate` - Create donation
- `GET /api/v1/posts/:id/donations` - Get donations for a post
- `GET /api/v1/posts/user/donations` - Get user's donations (protected)

### Emergency Centers
- `GET /api/v1/centers` - Get all emergency centers
- `GET /api/v1/centers/:id` - Get single center
- `POST /api/v1/centers` - Create center (protected)
- `PUT /api/v1/centers/:id` - Update center (admin/moderator)
- `DELETE /api/v1/centers/:id` - Delete center (admin)

### Profiles
- `GET /api/v1/profiles/leaderboard` - Get top donors
- `GET /api/v1/profiles/me` - Get own profile (protected)
- `GET /api/v1/profiles/:userId` - Get user profile

### Flags/Reports
- `POST /api/v1/posts/:id/flag` - Report a post
- `GET /api/v1/posts/flagged` - Get flagged posts (admin/moderator)
- `POST /api/v1/posts/:id/resolve` - Resolve flag (admin/moderator)

## Query Parameters

### GET /api/v1/posts
- `category` - Filter by category (food, dry_rations, baby_items, medical, clothes, other)
- `district` - Filter by district
- `status` - Filter by status (active, fulfilled, flagged, hidden)
- `search` - Search in title, description, or location
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

## Database Schema

### Users
- id (UUID, PK)
- email (String, Unique)
- password (String, Nullable)
- full_name (String)
- avatar_url (String)
- google_id (String, Unique)
- role (Enum: user, admin, moderator)
- is_verified (Boolean)
- last_login (DateTime)

### Need Posts
- id (UUID, PK)
- victim_name (String)
- phone_number (String)
- whatsapp_link (String)
- location_district (String)
- location_city (String)
- location_lat (Decimal)
- location_lng (Decimal)
- category (Enum)
- title (String)
- description (Text)
- quantity_needed (Integer)
- quantity_donated (Integer)
- status (Enum: active, fulfilled, flagged, hidden)
- edit_pin (String)
- flag_count (Integer)
- voice_note_url (String)

### Donations
- id (UUID, PK)
- post_id (UUID, FK)
- donor_id (UUID, FK, Nullable)
- donor_name (String)
- quantity (Integer)
- message (Text)

### Donor Profiles
- id (UUID, PK)
- user_id (UUID, FK)
- full_name (String)
- avatar_url (String)
- families_helped (Integer)
- items_donated (Integer)
- districts_active (Integer)
- badges (Array)

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- JWT authentication
- Password hashing with bcrypt
- Input validation with express-validator
- File upload restrictions (size, type)

## File Uploads

Images are stored in:
- `uploads/posts/` - Need post images
- `uploads/avatars/` - User avatars

Maximum file size: 5MB
Allowed formats: JPEG, JPG, PNG, GIF, WebP

## Error Handling

All errors return JSON in the format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

The server uses `nodemon` for auto-restart during development. Any changes to `.js` files will automatically restart the server.

## License

MIT
