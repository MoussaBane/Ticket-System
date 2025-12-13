# Troubleshooting Guide

## Quick Diagnostics

Run this first:

```bash
# Check Node.js
node --version   # Should be v18+

# Check npm
npm --version    # Should be v8+

# Check MongoDB
mongod --version # Should be v5.0+

# Check server
curl http://localhost:3000
```

---

## Common Issues & Solutions

### 1. Server Won't Start

**Error:** `Error: listen EADDRINUSE :::3000`

**Cause:** Port 3000 is already in use

**Solution:**

```bash
# Find process using port
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

**Alternative:**
```bash
# Restart everything
pkill -f "npm start"
pkill -f "node"
npm start
```

---

### 2. MongoDB Connection Error

**Error:** `MongooseError: Cannot connect to MongoDB`

**Cause:** MongoDB not running or connection string invalid

**Solution:**

```bash
# Check MongoDB running
sudo systemctl status mongod

# Start if stopped
sudo systemctl start mongod

# For Mac
brew services start mongodb-community

# Verify connection
mongosh  # or mongo
> use ticket-system
> db.collection.findOne()
```

**Check Connection String:**
```bash
# Local
MONGODB_URI=mongodb://localhost:27017/ticket-system

# Atlas (cloud)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ticket-system
```

**Test Connection:**
```bash
mongosh "mongodb://localhost:27017"
mongosh "mongodb+srv://user:password@cluster.mongodb.net/ticket-system"
```

---

### 3. Dependencies Installation Fails

**Error:** `npm ERR! code ERESOLVE`

**Cause:** Dependency conflict

**Solution:**

```bash
# Clear cache
npm cache clean --force

# Remove lockfile and node_modules
rm -rf package-lock.json node_modules

# Reinstall
npm install

# If still fails, force legacy peer dependency resolution
npm install --legacy-peer-deps
```

---

### 4. JWT Token Errors

**Error:** `401 Unauthorized` or `Invalid token`

**Cause:**
- Token expired (3 hour expiration)
- JWT_SECRET not set
- Malformed token

**Solution:**

```bash
# Check JWT_SECRET in .env
cat .env | grep JWT_SECRET

# Should be 32+ characters
# Generate new one
openssl rand -base64 32

# Update .env
JWT_SECRET=<new-value>

# Restart server
npm start
```

**Test Token:**
```bash
# Get token
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"TempPassword123!"}'

# Use token
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/admin/tickets
```

---

### 5. Login Not Working

**Error:** `Invalid credentials` or `User not found`

**Cause:**
- User doesn't exist
- Password incorrect
- Database issue

**Solution:**

```bash
# Check if user exists in database
mongosh
> use ticket-system
> db.users.find({ email: "admin@example.com" })

# If not found, run seed
node scripts/seedUsers.js

# Reset password (if using bcrypt)
# Use MongoDB to update password hash
```

**Create User Manually:**
```bash
mongosh
> use ticket-system
> db.users.insertOne({
    email: "test@example.com",
    nom: "Test",
    prenom: "User",
    role: "admin",
    isRegistered: true
  })
```

---

### 6. Tickets Not Generating

**Error:** Generation runs but no tickets created

**Cause:**
- Database connection issue
- Counter model missing
- Duplicate code generation

**Solution:**

```bash
# Check Counter collection
mongosh
> use ticket-system
> db.counters.find()

# If missing, create it
> db.counters.insertOne({
    _id: "ticketNo",
    seq: 0
  })

# Verify Ticket collection has data
> db.tickets.count()

# Reset tickets if needed
> db.tickets.deleteMany({})
> db.counters.deleteMany({})
```

**Try Generating Again:**
```bash
# Via endpoint
curl -X POST http://localhost:3000/generate-tickets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

---

### 7. Download Button Not Working

**Error:** Button clicks but nothing happens

**Cause:**
- Token not in localStorage
- Endpoint returns error
- Browser blocking download

**Solution:**

```bash
# Check localStorage in browser console
localStorage.getItem('token')  // Should have value

# If empty, login again
```

**Check Network Tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click Download button
4. Check response status and body

**Common Response Errors:**
```json
// 401 - Not logged in
{ "success": false, "message": "Unauthorized" }

// 403 - Not authorized for this ticket
{ "success": false, "message": "Forbidden" }

// 404 - Ticket not found
{ "success": false, "message": "Ticket not found" }
```

---

### 8. Image Download Quality Issues

**Error:** Downloaded PNG has wrong positioning/blurry

**Cause:**
- Old cached files
- Wrong template selected
- Image service not updated

**Solution:**

```bash
# Clear cached images
rm -rf public/tickets/images/*

# Clear browser cache
# Chrome: Ctrl+Shift+Delete → Clear data

# Try download again
# New image will be generated

# Verify correct template
# Should see VIP or NORMAL in download URL
```

**Check Image Coordinates:**
```bash
# Open image in editor
# Verify QR at (1118, 224)
# Verify TicketNo at (1235, 111)  
# Verify Code at (1240, 520)
```

---

### 9. Real-time Progress Not Showing

**Error:** Generation starts but progress bar stuck

**Cause:**
- SSE connection dropped
- EventSource not supported (older browser)
- Token not passed to SSE

**Solution:**

```bash
# Check browser support
# Chrome, Firefox, Safari 6+, Edge all support EventSource

# Check Network tab during generation
# Should see: /generate-tickets-stream?count=X&token=Y
# Response type: text/event-stream

# Check token in URL
# If token missing or invalid, SSE fails
```

**Use Alternative (Manual Check):**
```bash
# Instead of SSE, check status
curl http://localhost:3000/admin/tickets/stats/summary \
  -H "Authorization: Bearer <token>"
```

---

### 10. CORS Errors

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Cause:** Frontend and backend on different domains

**Solution:**

Check `index.js` has CORS enabled:

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
```

**Update CORS Origins:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 11. Database Full / Too Much Data

**Error:** Slow queries or disk space issues

**Cause:** Too many tickets or logs

**Solution:**

```bash
# Check database size
mongosh
> use ticket-system
> db.stats()

# Check collection sizes
> db.tickets.stats()
> db.users.stats()

# Archive old tickets
> db.tickets_archive.insertMany(
    db.tickets.find({ createdAt: { $lt: ISODate("2025-01-01") } }).toArray()
  )

# Delete old tickets
> db.tickets.deleteMany({ createdAt: { $lt: ISODate("2025-01-01") } })

# Defragment
> db.repairDatabase()
```

---

### 12. Email Service Not Working

**Error:** Password reset email not sent

**Cause:** Email credentials wrong or SMTP blocked

**Solution:**

```bash
# Check credentials in .env
cat .env | grep EMAIL

# For Gmail, use App Password not regular password
# https://myaccount.google.com/apppasswords

# Test email
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
transporter.verify((err, success) => {
  console.log(err || 'Email configured correctly');
});
"
```

---

### 13. Performance Slow

**Error:** Tickets take long to generate or load

**Cause:** Large batch size, weak hardware, no indexes

**Solution:**

```bash
# Create MongoDB indexes
mongosh
> use ticket-system
> db.tickets.createIndex({ code: 1 })
> db.tickets.createIndex({ assignedTo: 1 })
> db.tickets.createIndex({ isUsed: 1 })
> db.users.createIndex({ email: 1 }, { unique: true })

# Check indexes
> db.tickets.getIndexes()
```

**Generate in Smaller Batches:**
```bash
# Instead of 1000 at once
# Generate 100 x 10 times with delays

# Or use SSE streaming endpoint
curl "http://localhost:3000/generate-tickets-stream?count=500&token=<token>"
```

**Monitor Performance:**
```bash
# Start server with PM2 monitoring
pm2 start index.js --name ticket-system
pm2 web  # Dashboard at http://localhost:9615

# Or use Node clinic
npm install -g clinic
clinic doctor -- npm start
```

---

### 14. SSL Certificate Issues

**Error:** `ERR_CERT_AUTHORITY_INVALID` in browser

**Cause:**
- Certificate expired
- Self-signed certificate
- Wrong domain

**Solution:**

```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout | grep -A 2 "Validity"

# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

**For Self-Signed (Development Only):**
```bash
# Generate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Add to Express
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(httpsOptions, app).listen(443);
```

---

### 15. File Upload Size Limit

**Error:** `413 Payload Too Large`

**Cause:** CSV/backup file too large

**Solution:**

```bash
# Increase limit in index.js
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public', { maxAge: '1d' }));
```

---

## Server Status Check

```bash
#!/bin/bash
# save as check-status.sh

echo "=== Node.js ==="
node --version

echo -e "\n=== npm ==="
npm --version

echo -e "\n=== MongoDB ==="
sudo systemctl status mongod | grep Active

echo -e "\n=== Server ==="
curl -s http://localhost:3000 > /dev/null && echo "✅ Server running" || echo "❌ Server down"

echo -e "\n=== Database ==="
mongosh --eval "db.stats()" ticket-system 2>/dev/null | grep "collections"

echo -e "\n=== Disk Space ==="
df -h | grep -E "Filesystem|/$"

echo -e "\n=== Memory ==="
free -h | grep Mem

echo -e "\n=== CPU ==="
top -bn1 | grep "Cpu(s)"
```

Run with:
```bash
chmod +x check-status.sh
./check-status.sh
```

---

## Getting Help

### 1. Check Logs

```bash
# Application logs
pm2 logs ticket-system

# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -xe
```

### 2. Enable Debug Mode

```bash
# In .env
DEBUG=*
NODE_ENV=development
DEBUG_VERBOSE=true

# Run server
npm start

# See detailed logs
```

### 3. Reproduce Issue

```bash
# Clear everything
rm -rf public/tickets/images/*
mongosh
> use ticket-system
> db.dropDatabase()

# Restart
npm start

# Try again
```

### 4. Backup Before Troubleshooting

```bash
# Backup database
mongodump --db ticket-system --out ./backup_$(date +%s)

# Backup files
cp -r . ../ticket-system-backup
```

---

**Still stuck?** Check the logs or create an issue on GitHub with:
- Error message (full)
- Steps to reproduce
- System info (OS, Node version, MongoDB version)
- Relevant logs

**Last Updated:** December 14, 2025
