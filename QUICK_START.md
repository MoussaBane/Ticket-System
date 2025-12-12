# 🚀 Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Environment Setup
```bash
cd "Ticket System"
cp .env.example .env
# Edit .env with your MongoDB URI and email credentials
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
```bash
npm run seed:users
```

### 4. Start Server
```bash
npm start
```

Server runs at `http://localhost:3000`

---

## 🔑 Default Credentials

| User | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `AdminPass123` |
| Manager | `manager@example.com` | `ManagerPass123` |

---

## 📱 Access Points

- **Admin Panel**: http://localhost:3000/admin.html
- **Manager Interface**: http://localhost:3000/manager.html
- **Login Page**: http://localhost:3000/admin-auth.html
- **Health Check**: http://localhost:3000/health

---

## 🔗 Common API Endpoints

### Login
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123"}'
```

### Get Tickets
```bash
curl -X GET http://localhost:3000/admin/tickets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Tickets
```bash
curl -X POST http://localhost:3000/generate-tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count":200}'
```

### Validate Ticket
```bash
curl -X POST http://localhost:3000/validate-ticket \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"12345678"}'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
✓ Check DB_URI in .env
✓ Verify IP whitelist in MongoDB Atlas
✓ Test: mongodb://localhost:27017/ticket_system
```

### Email Not Sending
```
✓ Check MAIL_USER and MAIL_PASS
✓ For Gmail: Use App Password (not regular password)
✓ Enable SMTP in email provider settings
```

### Port Already in Use
```bash
# Change PORT in .env or use different port:
PORT=3001 npm start
```

### Dependencies Missing
```bash
npm install
# Or reinstall everything:
rm -rf node_modules package-lock.json
npm install
```

---

## 📂 Project Structure

```
ticket-system/
├── index.js                 # Main server
├── package.json             # Dependencies
├── .env.example             # Config template
├── README.md               # Full documentation
├── CHANGELOG.md            # Change history
├── IMPROVEMENTS.md         # Audit results
│
├── middlewares/            # Authentication
│   ├── adminAuth.js
│   ├── verifyToken.js
│   └── roleAuth.js
│
├── routes/                 # API endpoints
│   ├── auth.js
│   ├── admin.js
│   ├── manager.js
│   └── users.js
│
├── models/                 # Database schemas
│   ├── User.js
│   ├── Ticket.js
│   └── Reservation.js
│
├── services/               # Business logic
│   ├── mailService.js
│   └── ticketPdfService.js
│
├── utils/                  # Utilities
│   ├── jwtUtils.js
│   └── responseUtils.js
│
└── public/                 # Frontend
    ├── admin.html
    ├── admin-auth.html
    ├── manager.html
    └── ...
```

---

## 🔄 Workflow Examples

### Admin: Generate & Send Tickets

```javascript
// 1. Create reservations (manually or via import)
// 2. Generate tickets from pending reservations
POST /api/admin/generate-tickets-from-reservations

// 3. Send emails with tickets
POST /api/admin/send-tickets-from-reservations

// 4. Validate tickets when attendees arrive
POST /validate-ticket (with code)
```

### Manager: Import Reservations

```javascript
// 1. Prepare CSV file: buyerName,buyerEmail,buyerPhone,holderName,holderEmail
// 2. Import CSV
POST /api/manager/import-reservations

// 3. View created reservations
GET /api/manager/reservations
```

### Admin: Manage Users

```javascript
// View all users
GET /api/users

// Change user role
PUT /api/users/:id/role

// Reset password
PUT /api/users/:id/reset-password

// Delete user
DELETE /api/users/:id
```

---

## ✅ Pre-Deployment Checklist

- [ ] .env configured with production values
- [ ] JWT_SECRET changed to strong random string
- [ ] MongoDB connection verified
- [ ] Email service configured and tested
- [ ] Database backed up
- [ ] All routes tested
- [ ] HTTPS enabled
- [ ] CORS configured for your domain
- [ ] Rate limiting verified
- [ ] Error logging set up

---

## 🆘 Support

### Check Logs
```bash
# Server logs printed to console
# Check browser console for frontend errors
# MongoDB connection logged on startup
```

### Test Endpoints
```bash
# Health check (no auth required)
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/admin/login ...
```

### Common Errors

| Error | Solution |
|-------|----------|
| "Token missing" | Include `Authorization: Bearer <token>` header |
| "Invalid token" | Token expired or JWT_SECRET changed |
| "Access denied" | User role doesn't have permission |
| "Not found" | Resource doesn't exist or wrong URL |
| "Server error" | Check server logs, MongoDB connection |

---

## 📞 Quick Help

**Q: How do I change the admin password?**
A: Use the profile page or `/api/users/:id/reset-password` endpoint

**Q: Can I generate unlimited tickets?**
A: Limited to 1000 per request to prevent system overload

**Q: How long are tokens valid?**
A: 3 hours by default (configurable via JWT_EXPIRES_IN)

**Q: Can tickets be regenerated after deletion?**
A: Yes, use POST /generate-tickets with new codes

**Q: How do I export ticket data?**
A: GET /admin/export-csv downloads as CSV file

---

## 🎯 Next Steps

1. ✅ **Read** `README.md` for complete documentation
2. ✅ **Review** `IMPROVEMENTS.md` for all changes made
3. ✅ **Check** `CHANGELOG.md` for version history
4. ✅ **Test** all endpoints using provided examples
5. ✅ **Deploy** following deployment guide in README

---

**Version**: 3.0.0  
**Status**: ✅ Production Ready  
**Updated**: December 2024
