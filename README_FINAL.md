# 🎫 Ticket System - Concert Lil-Dou AEEMT

**Version:** 4.1.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 14, 2025

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [System Requirements](#system-requirements)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Support](#support)
11. [Complete Documentation](#complete-documentation)

---

## 🚀 Quick Start

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Ticket-System

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start the server
npm start
# Server runs at http://localhost:3000

# 5. Access the admin panel
# Login: admin panel at http://localhost:3000/admin-auth.html
```

---

## ✨ Features
---

## 📚 Complete Documentation

This project includes comprehensive modular documentation for all aspects:

| Document | Purpose | Best For |
|----------|---------|----------|
| [docs/API.md](docs/API.md) | Complete API reference with examples | Developers, API consumers |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Step-by-step setup guides (Local/Docker/VPS) | DevOps, Ops teams |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment options (Render/AWS/Docker) | DevOps, Sysadmins |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, scaling | Architects, Senior devs |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 15+ solutions for common issues | Support, Users |

---

## ✨ Features

### Core Functionality
- ✅ **Dual Ticket Types:** VIP (limit: 90) and NORMAL (limit: 410)
- ✅ **Auto-Increment Numbers:** Sequential ticketNo (1, 2, 3...)
- ✅ **Real-Time Generation:** SSE streaming with progress bar
- ✅ **PNG Download:** Tickets with QR codes, positioned perfectly
- ✅ **One-Time Download:** Tracking prevents duplicate downloads
- ✅ **QR Validation:** Scan and mark tickets as used at event
- ✅ **Role-Based Access:** Admin, Manager, Normal user roles
- ✅ **Bulk Operations:** Generate, assign, delete tickets
- ✅ **CSV Export:** Export all tickets for external systems
- ✅ **Email Notifications:** Optional email sending

### Technical Features
- 🔐 JWT Authentication with 3-hour expiration
- 📊 Real-time statistics dashboard
- 🎨 Responsive Bootstrap 5 UI
- ⚡ Optimized batch processing (100 tickets/batch)
- 💾 MongoDB persistence
- 📱 Mobile-friendly admin panel

---

## 📦 System Requirements

### Minimum
- **Node.js:** 14.0.0 or higher
- **npm:** 6.0.0 or higher
- **MongoDB:** 4.4 or higher
- **RAM:** 512 MB
- **Storage:** 1 GB (for images)

### Recommended
- **Node.js:** 16.0.0 or higher
- **MongoDB:** 5.0+ with Atlas
- **RAM:** 2 GB
- **Bandwidth:** For real-time streaming

---

## 📥 Installation

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd Ticket-System

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values:
# - DB_URI: MongoDB connection string
# - JWT_SECRET: Random secure string
# - MAIL_USER/MAIL_PASS: Gmail SMTP credentials
# - BASE_URL: http://localhost:3000 (for QR validation)

# Start development server
npm start

# Server runs at: http://localhost:3000
```

### Production Deployment

See [Deployment Guide](#deployment) below.

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=production
BASE_URL=https://yourdomain.com

# Database
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticket_system

# JWT
JWT_SECRET=your_very_secure_secret_key_min_32_chars
JWT_EXPIRES_IN=3h

# Email (optional)
MAIL_SERVICE=gmail
MAIL_USER=your-email@gmail.com
MAIL_PASS=your_app_password  # Use App Password with 2FA
MAIL_NAME=Event Team
```

### Database Models

**Ticket Schema:**
```javascript
{
  ticketNo: Number,        // Sequential (1, 2, 3...)
  code: String,            // 6-digit unique code
  ticketType: String,      // VIP or NORMAL
  isAssigned: Boolean,
  assignedTo: String,
  assignedEmail: String,
  assignedBy: ObjectId,    // User who assigned
  isUsed: Boolean,
  usedAt: Date,
  isDownloaded: Boolean,   // Prevents duplicate downloads
  downloadedAt: Date,
  createdAt: Date
}
```

---

## 💼 Usage

### Admin Dashboard

**Access:** http://localhost:3000/admin-auth.html

#### Main Features
1. **Generate Tickets**
   - Click "Générer Tickets"
   - Enter quantity (1-1000)
   - Watch real-time progress
   - Tickets auto-numbered

2. **Assign Tickets**
   - Bulk assign: Select count and type
   - Single assign: Click ticket row
   - Auto-linked to current user

3. **Manage Tickets**
   - View all tickets in table
   - Filter by type (VIP/NORMAL)
   - Filter by status (Assigned/Used/Available)
   - Search by code or assignee

4. **Download & Validate**
   - Download button on assigned tickets
   - Button disables after first download
   - Use QR code for validation at event

5. **Export Data**
   - Export all tickets as CSV
   - Import into external systems

### User Portal

**Access:** http://localhost:3000/profile.html

- View assigned tickets
- Download ticket images
- Update profile info
- Change password

---

## 🔌 API Documentation

### Authentication

**POST /admin/login**
```javascript
// Request
{
  email: "admin@example.com",
  password: "securepassword"
}

// Response
{
  token: "eyJhbGc...",
  user: {
    id: "...",
    email: "admin@example.com",
    role: "admin"
  }
}
```

### Tickets

**GET /admin/tickets**
- List all tickets with QR codes
- Auth: Admin only
- Query params: `?status=assigned|used|unassigned`

**GET /admin/tickets/stats/summary**
- Get ticket statistics
- Returns: VIP/NORMAL counts, remaining, used

**POST /generate-tickets** (Sync)
- Generate tickets immediately
- Body: `{ count: 200 }`
- Returns: Generated count

**GET /generate-tickets-stream** (SSE)
- Real-time progress streaming
- Query: `?count=200&token=<JWT>`
- Events: start, progress, complete, error

**POST /admin/tickets/assign-bulk**
- Assign multiple tickets at once
- Body: `{ count: 10, ticketType: "VIP" }`

**PUT /admin/tickets/:id/assign**
- Assign single ticket
- Body: `{ ticketType: "NORMAL" }`

**PUT /admin/tickets/:id/validate**
- Mark ticket as used
- Admin only

**POST /delete-all-tickets**
- Delete all tickets and reset counter
- ⚠️ Irreversible!

**GET /api/users/my-tickets/download/:code**
- Download ticket image (PNG)
- User must be assigned ticket
- Marks ticket as downloaded

### Statistics

**GET /admin/tickets/stats/summary**
```javascript
// Response
{
  total: 500,
  assigned: 450,
  available: 50,
  used: 200,
  vip: { total: 90, limit: 90, remaining: 0, used: 85 },
  normal: { total: 410, limit: 410, remaining: 0, used: 115 }
}
```

---

## 🚀 Deployment

### Render.yaml Configuration

```yaml
services:
  - type: web
    name: ticket-system
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DB_URI
        fromDatabase:
          name: mongodb
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
```

### Deployment Steps

1. **Prepare Code**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin for_aeemt
   ```

2. **Deploy to Render**
   - Go to https://dashboard.render.com
   - Create New → Web Service
   - Connect GitHub repository
   - Use `render.yaml` for auto-config
   - Set environment variables
   - Deploy

3. **Configure Domain**
   - Update DNS to Render endpoints
   - Update `BASE_URL` in environment
   - Enable HTTPS (automatic)

4. **Setup Database**
   - Create MongoDB Atlas cluster
   - Whitelist Render IP
   - Copy connection string to `DB_URI`

5. **Verify Deployment**
   ```bash
   curl https://yourdomain.com/health
   # Should return: {"status":"ok"}
   ```

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t ticket-system .
docker run -p 3000:3000 --env-file .env ticket-system
```

---

## 🐛 Troubleshooting

### Issue: Server crashes on startup

**Solution:**
```bash
# Check MongoDB connection
# Verify DB_URI in .env
# Check JWT_SECRET exists
# Ensure node_modules installed
npm install
npm start
```

### Issue: Tickets download with wrong positioning

**Solution:**
```bash
# Clear image cache
rm -rf public/tickets/images/*

# Regenerate in admin panel
# Or: node scripts/generateSampleImages.js

# Hard refresh browser: Ctrl+Shift+Delete then Ctrl+F5
```

### Issue: SSE progress not showing

**Solution:**
- Ensure token in query parameter
- Check browser console for errors
- Verify admin role on user
- Try in private window (no cache)

### Issue: MongoDB connection timeout

**Solution:**
```bash
# Check connection string format
# mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Whitelist IP address in MongoDB Atlas
# Network Access → Add IP Address

# Test connection
node -e "require('mongoose').connect(process.env.DB_URI)"
```

### Issue: Email not sending

**Solution:**
```bash
# Use Gmail App Password (not regular password)
# Enable 2FA on Gmail account
# Generate app password at: https://myaccount.google.com/apppasswords
# Paste in MAIL_PASS

# Test:
node scripts/testEmail.js
```

---

## 📁 Project Structure

```
ticket-system/
├── index.js                          # Main server
├── package.json                      # Dependencies
├── .env.example                      # Config template
├── render.yaml                       # Deployment config
│
├── models/                           # Database schemas
│   ├── Ticket.js                    # Ticket model
│   ├── User.js                      # User/auth
│   ├── Reservation.js               # Reservations
│   └── Counter.js                   # Auto-increment
│
├── routes/                           # API routes
│   ├── admin.js                     # Admin endpoints
│   ├── auth.js                      # Login/register
│   ├── users.js                     # User endpoints
│   └── manager.js                   # Manager routes
│
├── services/                         # Business logic
│   ├── ticketImageService.js        # PNG generation
│   ├── counterService.js            # Counter management
│   ├── ticketPdfService.js          # PDF generation
│   └── mailService.js               # Email sending
│
├── middlewares/                      # Express middlewares
│   ├── verifyToken.js               # JWT verification
│   ├── adminAuth.js                 # Admin guard
│   └── roleAuth.js                  # Role verification
│
├── utils/                            # Utilities
│   ├── responseUtils.js             # API responses
│   └── jwtUtils.js                  # JWT helpers
│
├── public/                           # Static files
│   ├── admin.html                   # Admin dashboard
│   ├── admin-auth.html              # Admin login
│   ├── profile.html                 # User profile
│   ├── index.html                   # Validation page
│   ├── vip.png                      # VIP template
│   ├── normal.png                   # NORMAL template
│   └── tickets/images/              # Generated images
│
├── scripts/                          # Utility scripts
│   ├── generateSampleImages.js       # Test generation
│   ├── seedUsers.js                 # Create seed users
│   ├── migrateTicketNo.js           # Data migration
│   └── checkTickets.js              # DB inspection
│
├── docs/                            # Documentation (NEW)
│   ├── API.md                       # API reference
│   ├── INSTALLATION.md              # Setup guide
│   ├── DEPLOYMENT.md                # Production guide
│   ├── TROUBLESHOOTING.md           # Issues & fixes
│   └── ARCHITECTURE.md              # System design
│
└── README.md                        # This file
```

---

## 👥 Roles & Permissions

### Admin
- ✅ Generate tickets
- ✅ Assign tickets
- ✅ Validate tickets
- ✅ Delete all tickets
- ✅ View statistics
- ✅ Export CSV

### Manager
- ✅ Assign tickets (to self)
- ✅ Validate tickets
- ✅ View statistics
- ✅ Download assigned tickets
- ❌ Delete tickets
- ❌ Generate tickets

### Normal User
- ✅ View profile
- ✅ Download assigned tickets
- ✅ Update password
- ❌ Assign tickets
- ❌ View all tickets
- ❌ Validate tickets

---

## 📊 Performance

### Benchmarks
- **Ticket Generation:** 5-10 tickets/sec (batched)
- **Image Generation:** 300-500ms per ticket
- **Database Query:** <50ms for individual ops
- **Bulk Operations:** 100-ticket batches processed in ~2 seconds

### Optimization Tips
1. Use batch generation (100+ tickets at once)
2. Cache QR codes for repeated codes
3. Use MongoDB indexes (already configured)
4. Enable compression in production

---

## 🔒 Security

### Implemented
- ✅ JWT authentication (3-hour expiration)
- ✅ Role-based access control
- ✅ Input validation & sanitization
- ✅ Password hashing (bcryptjs)
- ✅ HTTPS in production
- ✅ No-cache headers on sensitive endpoints

### Best Practices
- Change `JWT_SECRET` to 32+ random characters
- Use strong passwords for admin accounts
- Enable 2FA on Gmail for email sending
- Whitelist MongoDB IP access
- Regular dependency updates

---

## 📞 Support

### Getting Help

1. **Check Troubleshooting** section above
2. **Review logs:** Check console output for errors
3. **Database inspection:** `node scripts/checkTickets.js`
4. **Test generation:** `node scripts/generateSampleImages.js`

### Common Commands

```bash
# Start server
npm start

# Development with auto-reload
npm run dev

# Create seed users
npm run seed:users

# Test system
npm run test:v4

# Generate samples
node scripts/generateSampleImages.js

# Check database
node scripts/checkTickets.js
```

---

## 📄 License

ISC © 2025 Moussa BANE

---

## 🎉 Credits

**Built for:** Concert Lil-Dou AEEMT  
**Maintained by:** Moussa BANE  
**Last Updated:** December 14, 2025

---

**Happy ticket managing! 🎫**
