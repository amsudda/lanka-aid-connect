# Lanka Aid Connect - Deployment Guide

## Docker Deployment

This guide covers deploying Lanka Aid Connect using Docker on a VPS.

### Prerequisites

- Docker and Docker Compose installed on your VPS
- Domain name (optional but recommended)
- MySQL database or use the included MySQL container

### Project Structure

```
lanka-aid-connect/
├── lanka-aid-connect-main/   # Frontend (Vite + React)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── backend/                   # Backend (Express.js)
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml         # Full-stack orchestration
└── .env                       # Environment variables
```

### Base Directories for Deployment

- **Frontend**: `/lanka-aid-connect-main` or `/`
- **Backend**: `/backend`
- **Full-stack (docker-compose)**: `/` (root directory)

### Deployment Options

#### Option 1: Full Stack Deployment (Recommended)

Deploy both frontend, backend, and database together using docker-compose:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/iamsudda/lanka-aid-connect.git
   cd lanka-aid-connect
   ```

2. **Create .env file**:
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Update environment variables**:
   - Set secure passwords for database
   - Add Google OAuth credentials
   - Set JWT and session secrets

4. **Build and start services**:
   ```bash
   docker-compose up -d --build
   ```

5. **Check service status**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

6. **Access the application**:
   - Frontend: http://your-vps-ip
   - Backend API: http://your-vps-ip:5000

#### Option 2: Frontend Only Deployment

Deploy only the frontend (if backend is hosted separately):

1. **Navigate to frontend directory**:
   ```bash
   cd lanka-aid-connect-main
   ```

2. **Build Docker image**:
   ```bash
   docker build -t lanka-aid-frontend .
   ```

3. **Run container**:
   ```bash
   docker run -d -p 80:80 --name lanka-aid-frontend lanka-aid-frontend
   ```

**Base Directory**: `/lanka-aid-connect-main` or `/`

#### Option 3: Backend Only Deployment

Deploy only the backend:

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create .env file with database credentials**

3. **Build Docker image**:
   ```bash
   docker build -t lanka-aid-backend .
   ```

4. **Run container**:
   ```bash
   docker run -d -p 5000:5000 \
     --env-file .env \
     --name lanka-aid-backend \
     lanka-aid-backend
   ```

**Base Directory**: `/backend`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database Configuration
DB_ROOT_PASSWORD=your-secure-root-password
DB_NAME=lanka_aid_connect
DB_USER=lanka_user
DB_PASSWORD=your-secure-password

# Backend Configuration
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://your-domain.com:5000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://your-domain.com
```

### Database Setup

The database will be automatically created when using docker-compose. To run migrations:

```bash
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

### SSL/HTTPS Setup

For production, use a reverse proxy like Nginx or Traefik with Let's Encrypt:

1. **Install Certbot**:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Configure Nginx as reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Useful Commands

**View logs**:
```bash
docker-compose logs -f [service_name]
```

**Restart services**:
```bash
docker-compose restart [service_name]
```

**Stop services**:
```bash
docker-compose down
```

**Update and rebuild**:
```bash
git pull
docker-compose down
docker-compose up -d --build
```

**Database backup**:
```bash
docker-compose exec db mysqldump -u root -p lanka_aid_connect > backup.sql
```

**Database restore**:
```bash
docker-compose exec -T db mysql -u root -p lanka_aid_connect < backup.sql
```

### Monitoring

Check container health:
```bash
docker-compose ps
docker stats
```

### Troubleshooting

**Port already in use**:
```bash
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :3306
```

**Container won't start**:
```bash
docker-compose logs [service_name]
docker-compose down
docker-compose up -d --build
```

**Database connection issues**:
- Ensure database container is healthy: `docker-compose ps`
- Check environment variables in `.env`
- Wait for database initialization (first run takes longer)

### Performance Optimization

1. **Enable Gzip compression** (already configured in nginx.conf)
2. **Use CDN** for static assets
3. **Database indexing** for frequently queried fields
4. **Redis caching** for API responses (optional enhancement)

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT and session secrets
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (UFW or iptables)
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (already configured in backend)

## Support

For issues or questions, please open an issue on GitHub.
