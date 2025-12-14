# Architecture & System Design

## System Overview

The Ticket System is a full-stack Node.js/MongoDB application for managing event tickets with real-time features, role-based access control, and image-based ticket generation.

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                          │
│  Browser (HTML/CSS/JS) + Real-Time SSE Connection      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS.JS SERVER (Node.js)               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Routes     │  │ Middleware   │  │  Services    │  │
│  │ /admin      │  │ - JWT Auth   │  │ - Ticket Img │  │
│  │ /auth       │  │ - Role Check │  │ - Mail       │  │
│  │ /users      │  │ - CORS       │  │ - PDF        │  │
│  │ /manager    │  │ - Compress   │  │              │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌────────────┐
   │MongoDB  │  │ JWT      │  │ Image Lib  │
   │Database │  │ Service  │  │ (Jimp)     │
   └─────────┘  └──────────┘  └────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Files:** `public/*.html` + Vanilla JavaScript

**Components:**
- `admin.html` - Admin dashboard (generate, assign, validate tickets)
- `manager.html` - Manager dashboard (assign and scan)
- `pending.html` - Pending registrations
- `qr-scanner.html` - QR code scanner
- `scan.html` - Live scanning interface
- `users.html` - User management
- `profile.html` - User profile page
- `index.html` - Login/landing page

**Key Features:**
- Real-time updates via Server-Sent Events (SSE)
- Bootstrap 5 responsive UI
- JWT token stored in localStorage
- No build process (vanilla JS)

---

### 2. API Layer (Routes)

**Files:** `routes/*.js`

#### admin.js
```
POST   /admin/login           - User login (any role)
GET    /admin/tickets         - List all tickets
POST   /generate-tickets      - Generate tickets (sync)
POST   /delete-all-tickets    - Delete all and reset
POST   /admin/tickets/assign-bulk - Bulk assign
PUT    /admin/tickets/:id/assign  - Single assign
PUT    /admin/tickets/:id/validate - Mark as used
GET    /admin/export-csv      - Export to CSV
GET    /admin/tickets/stats/summary - Statistics
GET    /validate              - Validate by code
```

#### auth.js
```
POST   /admin/register        - Register new user
POST   /admin/login           - Login
GET    /admin/me              - Get current user
```

#### users.js
```
GET    /api/users/me          - Current user profile
PUT    /api/users/me          - Update profile/password
GET    /api/users/my-tickets  - User's assigned tickets
GET    /api/users/my-tickets/download/:code - Download PNG
```

#### manager.js
```
GET    /manager/pending       - Pending registrations
PUT    /manager/approve/:id   - Approve registration
```

---

### 3. Business Logic Layer (Services)

**Files:** `services/*.js`

#### ticketImageService.js
- **Purpose:** Generate ticket PNG images with overlays
- **Input:** Ticket object, template type (VIP|NORMAL)
- **Process:**
  1. Load template image (1500x800px)
  2. Generate and overlay QR code (229×229px at 1118,224)
  3. Overlay ticket number (centered at 1235,111)
  4. Overlay 6-digit code (at 1240,520)
  5. Save to PNG file
- **Output:** File path or base64 image
- **Coordinates:**
  - QR: P9(1118,224) to P12(1118,453) = 229×229
  - TicketNo: P13(1199,111) to P14(1271,111) = centered x=1235
  - Code: P15(1253,538) to P16(1349,538) = x=1240, y=520

#### mailService.js
- **Purpose:** Send transactional emails
- **Supports:** Gmail, custom SMTP
- **Templates:** Reset password, welcome, ticket confirmation

#### ticketPdfService.js
- **Purpose:** Generate PDF reports
- **Output:** Multi-page PDF with tickets summary

---

### 4. Data Access Layer (Models)

**Files:** `models/*.js`

#### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  nom: String,
  prenom: String,
  role: ['admin', 'manager', 'normal'],
  isRegistered: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Ticket Model
```javascript
{
  _id: ObjectId,
  code: String (unique, 6-digit),
  ticketNo: Number (sequential 1, 2, 3...),
  ticketType: ['VIP', 'NORMAL'],
  qrUrl: String,
  isAssigned: Boolean,
  assignedTo: String,
  assignedBy: ObjectId (User),
  assignedAt: Date,
  isDownloaded: Boolean,
  downloadedAt: Date,
  isUsed: Boolean,
  usedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Reservation Model
```javascript
{
  _id: ObjectId,
  ticketCode: String,
  user: ObjectId (User),
  status: ['pending', 'confirmed', 'cancelled'],
  createdAt: Date
}
```

#### Counter Model
```javascript
{
  _id: 'ticketNo',
  seq: Number  // Current sequence
}
```

---

### 5. Middleware Layer

**Files:** `middlewares/*.js`

#### verifyToken.js
- Extracts JWT from Authorization header
- Validates token signature and expiration
- Attached to all protected routes

#### adminAuth.js
- Checks if user role is 'admin'
- Returns 403 if not authorized

#### roleAuth.js
- Generic role check middleware
- Usage: `roleAuth(['admin', 'manager'])`

---

### 6. Utility Layer

**Files:** `utils/*.js`

#### jwtUtils.js
- Create tokens: `generateToken(userId, role, expiresIn)`
- Verify tokens: `verifyJWT(token)`
- Token expiration: 3 hours default

#### responseUtils.js
- Standardized response format
- Success: `sendSuccess(res, data, message, statusCode)`
- Error: `sendError(res, message, statusCode)`

---

## Data Flow Diagrams

### Ticket Generation Flow

```
User clicks "Generate"
        │
        ▼
┌──────────────────────────────┐
│ /generate-tickets-stream     │
│ (POST with count=500)        │
└──────────────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    BATCH 1              BATCH 2 (etc)
        │                     │
        ├─ Create 100 Tickets ─┤
        │                     │
        ├─ Counter.seq++ x100 ─┤
        │                     │
        ├─ Insert to MongoDB  ─┤
        │                     │
        ├─ Emit SSE Event    ─┤
        │ (progress: 20%)    │
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
           ┌───────────────┐
           │ All Created   │
           │ SSE Complete  │
           └───────────────┘
```

### Download Flow

```
User clicks "Download"
        │
        ▼
┌───────────────────────────────┐
│ GET /download/:code?template  │
│ Authorization: Bearer <token> │
└───────────┬───────────────────┘
            │
    ┌───────┴───────┐
    │               │
 VERIFY         CHECK
 TOKEN          AUTH
    │               │
    └───────┬───────┘
            │
            ▼
    ┌───────────────────┐
    │ Find Ticket       │
    │ in MongoDB        │
    └───────┬───────────┘
            │
    ┌───────┴───────┐
    │               │
 CHECK        GET
 OWNER        CODE
    │               │
    └───────┬───────┘
            │
            ▼
    ┌───────────────────────────┐
    │ Call ticketImageService   │
    │ Generate PNG with overlays│
    └───────┬───────────────────┘
            │
            ▼
    ┌───────────────────────┐
    │ Update Ticket:        │
    │ isDownloaded=true     │
    │ downloadedAt=now()    │
    └───────┬───────────────┘
            │
            ▼
    ┌───────────────────────────┐
    │ Return PNG File           │
    │ Content-Type: image/png   │
    │ Cache-Control: no-cache   │
    └───────────────────────────┘
```

### Authentication Flow

```
User submits login form
        │
        ▼
POST /admin/login
{email, password}
        │
        ▼
┌─────────────────────────────────┐
│ Validation                      │
│ - Email format                  │
│ - Password length               │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Find User by Email              │
│ in MongoDB                      │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Compare Password Hash           │
│ (no bcrypt - uses basic auth)   │
└─────────┬───────────────────────┘
          │
      VALID?
      /  \
    YES  NO
     │    │
     ▼    ▼
   OK   401
     │    │
     ▼    ▼
┌──────┐ ┌─────────────┐
│ JWT  │ │ Error       │
│Token │ │ Response    │
└──────┘ └─────────────┘
     │
     ▼
Return {token, user}
+ Store in localStorage
```

---

## Real-Time Features (SSE)

### Server-Sent Events Implementation

```javascript
// Client connects
const eventSource = new EventSource(
  `/generate-tickets-stream?count=500&token=${token}`
);

// Receive events
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update progress bar
  progressBar.style.width = data.progress + '%';
};

// Server sends:
data: {"type":"progress","generated":100,"total":500,"progress":20}
data: {"type":"progress","generated":200,"total":500,"progress":40}
...
data: {"type":"complete","progress":100}
```

**Benefits over WebSocket:**
- Simpler to implement
- Built-in reconnection
- Lower bandwidth
- Good for one-way server → client

---

## Database Schema & Relationships

```
┌──────────────┐
│ Users        │
├──────────────┤
│ _id          │
│ email ◄──┐   │
│ role      │   │
│ nom       │   │
│ prenom    │   │
└──────────┘   │
               │
┌──────────────┴──────────────┐
│ Tickets                      │
├──────────────────────────────┤
│ _id                          │
│ code (unique)                │
│ ticketNo (auto-increment)    │
│ ticketType (VIP|NORMAL)      │
│ isAssigned                   │
│ assignedTo ←────────┘        │
│ assignedBy (User._id)        │
│ isDownloaded                 │
│ isUsed                       │
│ createdAt                    │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Counters                     │
├──────────────────────────────┤
│ _id: 'ticketNo'              │
│ seq: Number                  │
└──────────────────────────────┘
```

**Indexes Created:**
```javascript
db.tickets.createIndex({ code: 1 })
db.tickets.createIndex({ assignedTo: 1 })
db.tickets.createIndex({ isUsed: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## Security Architecture

### Authentication Chain

```
Request
  │
  ▼
┌──────────────────┐
│ Has Token?       │ ◄─── localStorage.token
└────┬─────────────┘
     │
     ▼
┌──────────────────────────────┐
│ verifyToken Middleware       │
│ - Extract from header        │
│ - Validate signature         │
│ - Check expiration           │
└────┬─────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│ Role Check (if needed)       │
│ - adminAuth, roleAuth()      │
│ - Returns 403 if no access   │
└────┬─────────────────────────┘
     │
     ▼
   Route Handler
```

### Password Security

**Current:** Plain text comparison (NOT RECOMMENDED)
```javascript
if (password === user.password) { /*...*/ }
```

**Recommended Upgrade:**
```javascript
const bcrypt = require('bcrypt');

// On registration
const hash = await bcrypt.hash(password, 10);

// On login
const isValid = await bcrypt.compare(password, user.password);
```

### Token Security

**JWT Features:**
- Algorithm: HS256 (HMAC SHA-256)
- Expiration: 3 hours
- Secret: Should be 32+ characters
- Stored in: localStorage (vulnerable to XSS)

**Recommendations:**
- Use HttpOnly cookies instead of localStorage
- Implement refresh tokens
- Rotate secret periodically
- Use HTTPS only

---

## Scaling Considerations

### Horizontal Scaling

```
                   ┌─────────────────────┐
                   │  Load Balancer      │
                   │  (Nginx/HAProxy)    │
                   └──────┬──────┬──────┐
                          │      │      │
            ┌─────────────┘      │      └────────┐
            │                    │               │
            ▼                    ▼               ▼
      ┌──────────┐        ┌──────────┐    ┌──────────┐
      │ Node.js  │        │ Node.js  │    │ Node.js  │
      │ Server 1 │        │ Server 2 │    │ Server N │
      └─────┬────┘        └─────┬────┘    └─────┬────┘
            │                   │              │
            └───────────────────┼──────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │ MongoDB Replica  │
                        │ Set (Sharded)    │
                        └──────────────────┘
```

**Challenges:**
- Session replication (use Mongo sessions)
- SSE load balancing (sticky sessions)
- Counter atomicity (MongoDB guarantees)

### Performance Optimization

| Optimization | Implementation |
|--------------|-----------------|
| Database Indexes | Created on all query fields |
| Connection Pool | Mongoose default: 10 connections |
| Compression | gzip middleware enabled |
| Caching | Redis (optional) |
| CDN | For static assets |
| Batch Operations | 100 tickets per batch |

---

## Deployment Topology

### Development
```
Localhost:3000
  ├─ Node.js Express
  ├─ MongoDB (local)
  └─ No HTTPS
```

### Production (Render)
```
yourdomain.com (HTTPS)
  ├─ Render Web Service
  │  └─ Auto-deployed on git push
  ├─ MongoDB Atlas (cloud)
  └─ SSL certificate (Let's Encrypt)
```

### Production (VPS)
```
yourdomain.com (HTTPS)
  ├─ Nginx (reverse proxy)
  ├─ PM2 (process manager)
  ├─ Node.js Express
  ├─ MongoDB (local)
  └─ UFW Firewall
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18+ |
| Backend | Express.js | 5.1.0 |
| Database | MongoDB | 5.0+ |
| ODM | Mongoose | 8.14.0 |
| Authentication | JWT (jose) | Latest |
| Image Processing | Jimp | 0.22.12 |
| QR Codes | qrcode | Latest |
| Email | Nodemailer | Latest |
| Frontend | Vanilla JS | ES6+ |
| UI Framework | Bootstrap | 5.0 |
| Icon Pack | Bootstrap Icons | Latest |

---

## API Rate Limiting (Recommended)

```javascript
const rateLimit = require('express-rate-limit');

// Login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  message: 'Too many login attempts'
});

// Generation
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests
  message: 'Generation limit exceeded'
});

app.post('/admin/login', loginLimiter, routes.login);
app.post('/generate-tickets', generateLimiter, routes.generate);
```

---

## Monitoring & Observability

### Application Metrics

```javascript
// Monitor with PM2
pm2 start index.js --name "ticket-system"
pm2 web  // Dashboard on :9615

// Metrics:
// - CPU %
// - Memory MB
// - Uptime
// - Restart count
// - Status
```

### Error Tracking

```javascript
// Implement Sentry or similar
const Sentry = require("@sentry/node");

Sentry.init({ dsn: process.env.SENTRY_DSN });

app.use(Sentry.Handlers.errorHandler());

try {
  // Code
} catch (error) {
  Sentry.captureException(error);
}
```

### Logging

```
├─ Application logs (PM2)
├─ MongoDB logs (/var/log/mongodb/)
├─ System logs (journalctl)
└─ Nginx logs (/var/log/nginx/)
```

---

**Last Updated:** December 14, 2025
