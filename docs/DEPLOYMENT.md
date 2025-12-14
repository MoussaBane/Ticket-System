# Deployment Guide

## Deployment Options Summary

| Option | Best For | Cost | Setup Time |
|--------|----------|------|------------|
| Render | Small-to-medium projects | Free-$20/mo | 5 minutes |
| Docker | Any environment | $5-50/mo | 15 minutes |
| VPS | Full control, scaling | $5-100/mo | 30 minutes |
| AWS/Azure | Enterprise scale | Pay-as-you-go | 30+ minutes |
| Self-hosted | Maximum control | Hardware only | 1+ hour |

---

## 1. Render Deployment (Recommended)

Easiest option for getting started. Zero DevOps knowledge needed.

### Prerequisites
- GitHub account with repository
- Render account (https://render.com)

### Step 1: Connect Repository

1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Connect GitHub account
5. Select your repository
6. Authorize Render

### Step 2: Configure Service

**Basic Settings:**
```
Name: ticket-system
Environment: Node
Region: Choose closest to users
Branch: main
Build Command: npm install
Start Command: npm start
```

### Step 3: Set Environment Variables

Click **Environment** tab, add:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ticket-system
JWT_SECRET=your-super-secret-key-min-32-chars-long-randomly-generated
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 4: Deploy

1. Click **Deploy** button
2. Watch build progress in logs
3. Get URL: `https://ticket-system-xxxx.onrender.com`

### Step 5: Verify

```bash
# Test endpoint
curl https://ticket-system-xxxx.onrender.com

# Should respond with 200 OK
```

### Auto-Deploy from Git

- Push to `main` branch
- Render automatically rebuilds and deploys
- Watch deployment in dashboard

### Scaling

**Free Tier:**
- 512MB RAM
- Auto-sleeps after 15 min inactivity
- Suitable for testing

**Paid Plans:**
- Starting $7/month (1GB RAM, no sleep)
- Auto-scaling available
- Better for production

---

## 2. Docker Deployment

Deploy locally or to cloud with Docker containers.

### Prerequisites
- Docker Desktop installed
- Docker Hub account (optional, for image registry)

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Place in project root.

### Step 2: Create Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: ticket-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: ticket-system

  app:
    build: .
    container_name: ticket-app
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/ticket-system
      JWT_SECRET: your-secret-key-here
    depends_on:
      - mongodb
    restart: unless-stopped

volumes:
  mongodb_data:
```

### Step 3: Build and Run

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Step 4: Verify

```bash
curl http://localhost:3000
```

### Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag ticket-system:latest yourusername/ticket-system:latest

# Push
docker push yourusername/ticket-system:latest

# Pull and run anywhere
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=... \
  yourusername/ticket-system:latest
```

### Deploy to AWS ECS

```bash
# Push to AWS ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag ticket-system:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/ticket-system:latest

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/ticket-system:latest

# Create ECS task in console
# Deploy through CloudFormation or console UI
```

---

## 3. VPS Deployment (Full Control)

Deploy to DigitalOcean, Linode, Vultr, etc.

### Prerequisites
- VPS with Ubuntu 20.04+ (minimum 512MB RAM)
- SSH access
- Domain name (recommended)

### Step 1: Initial Server Setup

```bash
# SSH to server
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser appuser
usermod -aG sudo appuser
su appuser
```

### Step 2: Install Node.js

```bash
# Download setup script
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install
sudo apt install -y nodejs

# Verify
node --version  # v18+
npm --version   # v8+
```

### Step 3: Install MongoDB

```bash
# Import GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | \
  sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Test
mongo --version
```

### Step 4: Clone and Setup Application

```bash
cd /home/appuser

git clone https://github.com/yourusername/ticket-system.git
cd ticket-system

npm install
```

### Step 5: Configure Environment

```bash
nano .env
```

Add:
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/ticket-system
JWT_SECRET=your-production-secret-key
```

### Step 6: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Start app
pm2 start index.js --name "ticket-system"

# Configure auto-start
pm2 startup
pm2 save

# Verify
pm2 status
```

### Step 7: Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Stop default
sudo systemctl stop nginx
```

Create config file:

```bash
sudo nano /etc/nginx/sites-available/ticket-system
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (add after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Optional: Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript;
}
```

Enable and test:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/ticket-system \
           /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Start
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 8: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

Update Nginx config to redirect HTTP to HTTPS:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

Restart:
```bash
sudo systemctl restart nginx
```

### Step 9: Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Step 10: Verify

```bash
# Check app running
pm2 status

# Check MongoDB
sudo systemctl status mongod

# Test HTTP
curl http://your-domain.com

# Test HTTPS
curl https://your-domain.com
```

---

## 4. AWS Deployment

### Option A: Elastic Beanstalk (Easiest)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" --region us-east-1

# Create environment
eb create ticket-system-env

# Deploy
eb deploy

# Open in browser
eb open

# View logs
eb logs
```

### Option B: Lambda + API Gateway (Serverless)

1. Rewrite Express app for AWS Lambda
2. Create API Gateway
3. Connect to MongoDB Atlas
4. Deploy with SAM or CloudFormation

---

## 5. Performance Optimization

### Database Indexing

```bash
# Create indexes on MongoDB
mongo ticket-system

# In mongo shell:
db.tickets.createIndex({ code: 1 })
db.tickets.createIndex({ assignedTo: 1 })
db.tickets.createIndex({ isUsed: 1 })
db.tickets.createIndex({ createdAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

### Caching Strategy

Add to Nginx:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

### Compression

Already in `index.js`:
```javascript
app.use(compression());
```

### CDN Integration (CloudFlare)

1. Sign up at cloudflare.com
2. Add domain
3. Change nameservers at registrar
4. Enable caching rules

---

## 6. Monitoring & Logging

### PM2 Monitoring

```bash
# Install monitoring
pm2 install pm2-logrotate
pm2 install pm2-auto-pull

# Dashboard
pm2 web  # http://localhost:9615

# Monitoring
pm2 monitor
```

### MongoDB Monitoring

```bash
# Check database size
mongo ticket-system --eval "db.stats()"

# Collection stats
mongo ticket-system --eval "db.tickets.stats()"

# Backup
mongodump --db ticket-system --out ./backup
```

### Application Logs

```bash
# View PM2 logs
pm2 logs ticket-system

# Clear logs
pm2 flush

# Save logs
pm2 save-logs
```

---

## 7. Backup & Recovery

### Automated MongoDB Backup

```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db ticket-system --out ./backups/backup_$DATE
gzip -r ./backups/backup_$DATE
```

```bash
# Make executable
chmod +x backup.sh

# Schedule with cron (daily at 2 AM)
crontab -e
0 2 * * * /home/appuser/ticket-system/backup.sh
```

### Restore from Backup

```bash
# Extract backup
gunzip -r ./backup_20251214.gz

# Restore
mongorestore --db ticket-system ./backup_20251214/ticket-system
```

---

## 8. Rolling Updates (Zero Downtime)

Using PM2 Cluster Mode:

```bash
# Edit index.js start command
pm2 start index.js -i max --name "ticket-system"

# Reload (zero downtime)
pm2 reload ticket-system
```

---

## 9. SSL Certificate Renewal

Automatic with Certbot:
```bash
sudo certbot renew --quiet
```

Or manual:
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection tested
- [ ] HTTPS enabled (production)
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Documentation updated
- [ ] DNS records correct
- [ ] Tested from clean browser
- [ ] Password reset working
- [ ] Ticket generation working
- [ ] Download working
- [ ] Mobile responsive

---

**Need Help?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Last Updated:** December 14, 2025
