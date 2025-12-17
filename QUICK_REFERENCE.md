# 🚀 Quick Reference - Production Commands

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start with nodemon (auto-reload)
npm run security:check  # Run security audit
```

### Production Deployment
```bash
# PM2 (Recommended)
npm install --production
npm run pm2:start       # Start in cluster mode
npm run pm2:logs        # View logs
npm run pm2:restart     # Restart application
npm run pm2:stop        # Stop application

# Direct Node
npm start               # Start with Node.js
```

### Health Checks
```bash
curl http://localhost:3000/health   # Basic health
curl http://localhost:3000/ready    # DB connectivity
```

### Security
```bash
npm run security:check  # Custom security audit
npm audit              # Check for vulnerabilities
npm audit fix          # Fix vulnerabilities
```

## Environment Variables (Production)

### Required ⚠️
```env
NODE_ENV=production
JWT_SECRET=<32+ characters>
DB_URI=mongodb+srv://...
```

### Optional
```env
PORT=3000
BASE_URL=https://yourdomain.com
TRUST_PROXY=true
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
JWT_EXPIRES_IN=3h
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register user

### Tickets (Auth Required)
- `GET /api/tickets/stats` - Statistics
- `POST /api/tickets/generate` - Generate tickets (Admin)
- `POST /api/tickets/validate` - Validate ticket
- `POST /api/tickets/assign` - Assign ticket
- `POST /api/tickets/assign-bulk` - Bulk assign

### Users (Admin Only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Default Credentials

```
Admin:   admin@example.com / AdminPass123
Manager: manager@example.com / ManagerPass123
```

**⚠️ Change in production!**

## Troubleshooting

### Server won't start
```bash
# Check environment
node -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"

# Validate JWT secret
node -e "require('dotenv').config(); console.log('Length:', process.env.JWT_SECRET?.length || 0)"

# Test DB connection
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.DB_URI).then(() => console.log('✅ OK')).catch(e => console.error('❌', e.message))"
```

### PM2 Issues
```bash
pm2 list               # Show all processes
pm2 describe ticket-system
pm2 restart ticket-system --update-env
pm2 delete ticket-system   # Remove from PM2
```

## File Structure

```
ticket-system/
├── backend/
│   ├── server.js              # Entry point
│   └── src/
│       ├── app.js             # Express app
│       ├── config/            # Configuration
│       ├── controllers/       # Route handlers
│       ├── middlewares/       # Auth, RBAC, errors
│       ├── models/            # Mongoose models
│       ├── routes/            # API routes
│       ├── services/          # Business logic
│       └── utils/             # Utilities
├── frontend/                  # Static files
├── scripts/                   # Utility scripts
├── ecosystem.config.js        # PM2 config
├── .env.example              # Environment template
└── PRODUCTION_DEPLOYMENT.md  # Full guide
```

## Quick Deploy (Render.com)

1. Push to GitHub
2. Connect in Render dashboard
3. Set environment variables
4. Deploy automatically

## Quick Deploy (VPS)

```bash
git clone <repo> && cd ticket-system
npm install --production
cp .env.example .env && nano .env
npm run security:check
npm run pm2:start
```

## Monitoring

```bash
pm2 monit              # Real-time monitor
pm2 logs ticket-system --lines 50
pm2 logs ticket-system --err
```

## Documentation

- **PRODUCTION_DEPLOYMENT.md** - Complete deployment guide
- **PRODUCTION_READY.md** - Readiness checklist
- **PRODUCTION_SUMMARY.md** - Audit summary
- **README.md** - Project overview
- **docs/API.md** - API documentation

---

**Version**: 5.0.0 | **Status**: Production Ready ✅
