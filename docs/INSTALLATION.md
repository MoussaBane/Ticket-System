# Installation Guide

## Prerequisites

### System Requirements
- **Node.js:** v18+ ([Download](https://nodejs.org/))
- **MongoDB:** v5.0+ (Local or Atlas cloud)
- **npm:** v8+ (comes with Node.js)
- **RAM:** Minimum 512MB, recommended 1GB+
- **Storage:** Minimum 200MB

### Optional but Recommended
- **Git** for version control
- **Visual Studio Code** for development
- **Postman** for API testing

---

## 1. Local Setup (Development)

### Step 1: Clone Repository

```bash
# Using Git
git clone https://github.com/yourusername/ticket-system.git
cd ticket-system

# OR manually download and extract ZIP
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 344 packages in 45s
```

### Step 3: Configure Environment

Create `.env` file in root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ticket-system
# OR for Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ticket-system

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Email Service (Optional for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password

# Admin Credentials (First user)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=TempPassword123!
ADMIN_NOM=BANE
ADMIN_PRENOM=Moussa
```

### Step 4: Initialize Database

```bash
# Create MongoDB database (automatic on first connection)
npm start
```

Wait for message: `✅ Server running on http://localhost:3000`

### Step 5: Seed Initial Users (Optional)

```bash
node scripts/seedUsers.js
```

**This creates:**
- 1 Admin user
- 3 Manager users
- 5 Normal users

### Step 6: Start Server

```bash
npm start
```

**Expected output:**
```
✅ Server running on http://localhost:3000
📊 Database connected
```

### Step 7: Access Dashboard

Open browser: http://localhost:3000

**Default login:**
- Email: `admin@example.com`
- Password: `TempPassword123!`

---

## 2. Production Setup

### Option A: Render Deployment

#### Prerequisites
- GitHub account
- Render account (free tier available)

#### Step 1: Prepare Repository

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

#### Step 2: Create Render Service

1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `ticket-system` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instances | 1 |

#### Step 3: Set Environment Variables

In Render dashboard, add:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ticket-system
JWT_SECRET=your-production-secret-key-min-32-characters
```

#### Step 4: Deploy

Click **Deploy** button. Wait for:
```
✅ Live on https://ticket-system.onrender.com
```

#### Step 5: Test Production

```bash
curl https://ticket-system.onrender.com
```

---

### Option B: Docker Deployment

#### Step 1: Install Docker

- **Windows/Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** `sudo apt install docker.io`

#### Step 2: Build Image

```bash
docker build -t ticket-system:latest .
```

#### Step 3: Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongodb:27017/ticket-system \
  -e JWT_SECRET=your-secret \
  --name ticket-system \
  ticket-system:latest
```

#### Step 4: Verify

```bash
docker ps
curl http://localhost:3000
```

---

### Option C: VPS Deployment (Ubuntu 20.04+)

#### Step 1: SSH to Server

```bash
ssh user@your-vps-ip
```

#### Step 2: Install Node.js

```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify v18+
```

#### Step 3: Install MongoDB

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

#### Step 4: Clone Application

```bash
git clone https://github.com/yourusername/ticket-system.git
cd ticket-system
npm install
```

#### Step 5: Configure Environment

```bash
nano .env
# Add production values
```

#### Step 6: Install Process Manager (PM2)

```bash
sudo npm install -g pm2
pm2 start index.js --name "ticket-system"
pm2 startup
pm2 save
```

#### Step 7: Setup Nginx Reverse Proxy

```bash
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/ticket-system
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/ticket-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Setup SSL (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 3. Development Workflow

### Environment Setup

```bash
# Install ESLint (optional but recommended)
npm install --save-dev eslint

# Initialize ESLint
npx eslint --init
```

### Running Tests

```bash
# Unit tests (if available)
npm test

# API testing with curl
curl -X GET http://localhost:3000/admin/tickets \
  -H "Authorization: Bearer <your-token>"
```

### Database Backup

```bash
# Export all data
mongoexport --db ticket-system --collection tickets --out tickets.json

# Restore data
mongoimport --db ticket-system --collection tickets tickets.json
```

---

## 4. Troubleshooting Installation

### Issue: `Module not found`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: `MongoDB connection error`

**Solution:**
```bash
# Check MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod

# For local: Check connection string
# For Atlas: Copy connection string from dashboard
```

### Issue: `Port 3000 already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# OR use different port
PORT=3001 npm start
```

### Issue: `JWT_SECRET not set`

**Solution:**
```bash
# Generate secure secret
openssl rand -base64 32

# Add to .env
JWT_SECRET=<generated-value>
```

### Issue: `CORS errors`

**Solution:**

Update CORS in `index.js`:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## 5. First Login

1. Navigate to http://localhost:3000
2. Click "Admin Login"
3. Use credentials from `.env`:
   - Email: `ADMIN_EMAIL`
   - Password: `ADMIN_PASSWORD`
4. Change password immediately (recommended)

---

## 6. Post-Installation

### Recommended Steps

- [ ] Change default admin password
- [ ] Create additional admin/manager accounts
- [ ] Generate initial 100-500 tickets
- [ ] Test ticket assignment and download
- [ ] Configure email service (if needed)
- [ ] Setup automated backups

### Security Checklist

- [ ] Store JWT_SECRET securely
- [ ] Enable HTTPS in production
- [ ] Restrict MongoDB access via firewall
- [ ] Setup rate limiting
- [ ] Enable CORS properly
- [ ] Rotate API secrets monthly

---

## 7. Verification Checklist

- [ ] Server starts without errors
- [ ] Dashboard loads at http://localhost:3000
- [ ] Login works with test credentials
- [ ] Can generate tickets
- [ ] Can assign and download tickets
- [ ] Database stores data persistently
- [ ] No console errors or warnings

---

**Need Help?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Last Updated:** December 14, 2025
