# Production Deployment Guide

## 🚀 Ticket System - Production Deployment

This guide covers deploying the Ticket System to production environments with best practices for security, performance, and reliability.

---

## 📋 Prerequisites

- **Node.js**: v16.0.0 or higher
- **MongoDB**: Atlas (cloud) or self-hosted
- **PM2** (optional): For process management
- **Git**: For deployment via repositories
- **SSL Certificate**: For HTTPS (recommended)

---

## 🔧 Environment Configuration

### 1. Create Production Environment File

Copy the example and configure:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

**Critical (Must Set):**
- `NODE_ENV=production`
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `DB_URI` - MongoDB Atlas connection string

**Server:**
- `PORT` - Default: 3000
- `BASE_URL` - Your production URL
- `TRUST_PROXY=true` - If behind load balancer

**CORS:**
- `CORS_ORIGINS` - Comma-separated allowed origins (e.g., `https://yourdomain.com,https://app.yourdomain.com`)

**Example Production .env:**

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://tickets.yourdomain.com
TRUST_PROXY=true

DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tickets?retryWrites=true&w=majority

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRES_IN=3h

CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

ENABLE_SEEDING=false
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**: [MongoDB Atlas](https://cloud.mongodb.com)
2. **Network Access**: Add your server IP to whitelist (or 0.0.0.0/0 for cloud platforms)
3. **Database User**: Create with read/write permissions
4. **Connection String**: Get from Atlas dashboard
   - Format: `mongodb+srv://<user>:<pass>@<host>/<db>?retryWrites=true&w=majority`

### Indexes (Auto-created on first run in development)

In production with `autoIndex: false`, ensure these indexes exist:

```javascript
// User collection
db.users.createIndex({ email: 1 }, { unique: true })

// Ticket collection
db.tickets.createIndex({ code: 1 }, { unique: true })
db.tickets.createIndex({ isUsed: 1 })
db.tickets.createIndex({ isAssigned: 1 })
db.tickets.createIndex({ ticketType: 1 })
db.tickets.createIndex({ isAssigned: 1, isUsed: 1 })
```

---

## 📦 Deployment Methods

### Option 1: Direct VPS/Server Deployment

#### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ticket-system.git
cd ticket-system

# Install dependencies
npm install --production

# Create logs directory
mkdir -p logs

# Configure environment
nano .env  # Edit with production values
```

#### Running with Node.js

```bash
# Simple start
npm start

# Or with nohup for background
nohup npm start > logs/app.log 2>&1 &
```

#### Running with PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
npm run pm2:start

# View logs
npm run pm2:logs

# Monitor
pm2 monit

# Setup auto-restart on server reboot
pm2 startup
pm2 save
```

---

### Option 2: Render.com Deployment

The `render.yaml` file is pre-configured.

#### Steps:

1. **Push to GitHub**: Ensure code is in a GitHub repository
2. **Connect Render**: 
   - Go to [Render Dashboard](https://dashboard.render.com)
   - New → Web Service → Connect Repository
3. **Environment Variables** (Set in Render Dashboard):
   ```
   NODE_ENV=production
   DB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-secret>
   BASE_URL=<your-render-url>
   TRUST_PROXY=true
   CORS_ORIGINS=<your-render-url>
   ```
4. **Deploy**: Render auto-deploys on push to main branch

**Health Check Endpoint**: `/ready` (reports DB connectivity)

---

### Option 3: Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "backend/server.js"]
```

**Build and Run:**

```bash
docker build -t ticket-system .
docker run -d -p 3000:3000 --env-file .env ticket-system
```

---

## 🔒 Security Checklist

- [x] **JWT Secret**: Strong 32+ character random string
- [x] **Database**: Credentials secured, not in code
- [x] **CORS**: Allowlist configured (not wildcard in production)
- [x] **Helmet**: Security headers enabled
- [x] **Rate Limiting**: Login and API rate limits active
- [x] **HTTPS**: SSL certificate configured (via reverse proxy/load balancer)
- [x] **Environment**: `NODE_ENV=production` set
- [x] **Password Hashing**: bcrypt with salt rounds=12
- [x] **Input Validation**: All user inputs validated
- [x] **Error Details**: Sensitive errors hidden in production

---

## 🔍 Monitoring & Maintenance

### Health Checks

- **Health**: `GET /health` - Basic server health
- **Readiness**: `GET /ready` - Includes DB connectivity status

### Logs

**PM2 Logs:**
```bash
pm2 logs ticket-system --lines 100
pm2 logs ticket-system --err    # Errors only
```

**Application Logs:**
- Location: `logs/pm2-*.log`
- Format: Timestamped JSON-like structure

### Security Audits

```bash
# Check for vulnerabilities
npm run audit:security

# Auto-fix if possible
npm run audit:fix
```

### Database Backups

**MongoDB Atlas**: Automated backups enabled by default

**Manual Backup:**
```bash
mongodump --uri="<your-connection-string>" --out=./backup
```

---

## 🚨 Troubleshooting

### Server Won't Start

1. **Check environment variables**:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.DB_URI ? 'DB_URI set' : 'DB_URI missing')"
   ```

2. **Validate JWT_SECRET length**:
   ```bash
   node -e "require('dotenv').config(); console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)"
   ```

3. **Test MongoDB connection**:
   ```bash
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.DB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
   ```

### Database Connection Failed

- Check MongoDB Atlas IP whitelist
- Verify credentials are URL-encoded
- Test connection string format
- Check network/firewall rules

### CORS Errors

- Add frontend domain to `CORS_ORIGINS`
- Ensure protocol matches (http vs https)
- Check for trailing slashes

### High Memory Usage

- Reduce PM2 instances
- Check for memory leaks with `pm2 monit`
- Lower `max_memory_restart` in ecosystem.config.js

---

## 📊 Performance Optimization

### Production Settings Already Enabled

- ✅ Compression middleware
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Mongoose autoIndex disabled in production
- ✅ Connection pooling (Mongoose default)

### Additional Optimizations

**Reverse Proxy (Nginx):**

```nginx
upstream ticket_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name tickets.yourdomain.com;
    
    location / {
        proxy_pass http://ticket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**CDN for Static Assets:**
- Serve frontend from CDN (Cloudflare, AWS CloudFront)
- Cache static files

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm install
      - run: npm audit
      # Add deployment steps (SSH, Render API, etc.)
```

---

## 📞 Support

For issues or questions:
- Check `TROUBLESHOOTING.md`
- Review application logs
- Verify environment configuration
- Test database connectivity

---

## 📝 Production Deployment Checklist

Before going live:

- [ ] Environment variables configured
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] MongoDB connection tested
- [ ] CORS origins set correctly
- [ ] SSL/HTTPS enabled
- [ ] Health checks responding
- [ ] Logs directory created
- [ ] PM2 or process manager configured
- [ ] Security audit passed (`npm audit`)
- [ ] Database indexes created
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Default admin user created (via seeding or manual)
- [ ] Test login/ticket flow works

---

**Version**: 5.0.0  
**Last Updated**: December 2025
