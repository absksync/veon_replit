# Deployment Guide for VEON

This guide covers various deployment options for VEON in production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Option 1: Single VPS (Recommended for beginners)](#option-1-single-vps)
  - [Option 2: Separate Services](#option-2-separate-services)
  - [Option 3: Docker Deployment](#option-3-docker-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Hugging Face API key
- Node.js v16+ on deployment server
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Environment Configuration

### Backend Production .env

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# API Keys
HUGGINGFACE_API_KEY=your_production_key_here

# Frontend URL for CORS
FRONTEND_URL=https://yourdomain.com

# Database (optional - defaults to local SQLite)
DATABASE_PATH=/var/veon/veon.db
```

### Frontend Production .env

```bash
VITE_SOCKET_URL=https://api.yourdomain.com
```

## Deployment Options

### Option 1: Single VPS

Deploy both frontend and backend on a single VPS (DigitalOcean, Linode, AWS EC2, etc.)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Clone and Build

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/absksync/veon_replit.git
cd veon_replit

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build
```

#### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/veon`:

```nginx
# Frontend (port 80/443)
server {
    listen 80;
    server_name yourdomain.com;
    
    root /opt/veon_replit/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy Socket.io and API to backend
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/veon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: Setup SSL

```bash
sudo certbot --nginx -d yourdomain.com
```

#### Step 5: Setup Process Manager (PM2)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /opt/veon_replit/backend
pm2 start src/index.js --name veon-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Separate Services

Deploy frontend on Vercel/Netlify and backend on a VPS.

#### Frontend (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. Add environment variable:
   - `VITE_SOCKET_URL`: Your backend URL

#### Backend (VPS)

Follow steps 1-5 from Option 1, but skip Nginx frontend configuration.

Configure Nginx for backend only:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Option 3: Docker Deployment

#### Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
```

#### Dockerfile for Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY}
      - NODE_ENV=production
    volumes:
      - veon-data:/app/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_SOCKET_URL=http://localhost:3001
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  veon-data:
```

Deploy:
```bash
docker-compose up -d
```

## Production Checklist

### Security
- [ ] Use HTTPS/SSL certificates
- [ ] Set strong environment variables
- [ ] Enable firewall (ufw or equivalent)
- [ ] Rate limit API endpoints
- [ ] Implement authentication (if needed)
- [ ] Regular security updates
- [ ] Backup database regularly

### Performance
- [ ] Enable Gzip compression in Nginx
- [ ] Set up CDN for static assets (optional)
- [ ] Configure caching headers
- [ ] Monitor memory usage
- [ ] Set up database indexes
- [ ] Enable Redis for Socket.io scaling (if needed)

### Reliability
- [ ] Set up process manager (PM2)
- [ ] Configure auto-restart on failure
- [ ] Set up health check monitoring
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Monitor disk space

### Nginx Optimizations

Add to nginx.conf:

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 256;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs veon-backend

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Application Logs

Backend logs location: `/var/log/veon/backend.log`

Setup log rotation in `/etc/logrotate.d/veon`:

```
/var/log/veon/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### Health Checks

Setup a monitoring service (UptimeRobot, Pingdom, etc.) to check:
- `https://yourdomain.com/api/health` every 5 minutes

## Database Backups

### Automated Backup Script

Create `/opt/veon/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/veon"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/opt/veon_replit/backend/veon.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE "$BACKUP_DIR/veon_$DATE.db"

# Keep only last 7 days
find $BACKUP_DIR -name "veon_*.db" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/veon/backup.sh
```

## Scaling Considerations

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer**: Nginx or HAProxy in front of multiple backend instances
2. **Redis Adapter**: For Socket.io to work across multiple servers
3. **PostgreSQL**: Replace SQLite for better concurrent access
4. **Message Queue**: RabbitMQ or Bull for AI request queuing

### Redis Setup for Socket.io

```bash
npm install @socket.io/redis-adapter redis
```

Update `backend/src/index.js`:

```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

## Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check logs
pm2 logs veon-backend

# Check if port is in use
sudo lsof -i :3001
```

**Socket.io connection fails**
- Verify CORS settings in backend
- Check firewall rules
- Ensure WebSocket is allowed in Nginx config

**High memory usage**
- Check for memory leaks: `pm2 monit`
- Restart process: `pm2 restart veon-backend`
- Increase server RAM if needed

**Database locked errors**
- SQLite doesn't handle high concurrency well
- Consider migrating to PostgreSQL

## Support

For deployment issues, open an issue on GitHub or consult the documentation:
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [README.md](README.md)

---

Happy deploying! 🚀
