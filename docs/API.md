# API Reference - Ticket System

## Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`

---

## Authentication

### Login
**POST** `/admin/login`

Register and authenticate users.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "nom": "BANE",
      "prenom": "Moussa",
      "role": "admin"
    }
  }
}
```

**Errors:**
- `400` - Invalid credentials
- `500` - Server error

---

## Tickets

### List All Tickets
**GET** `/admin/tickets`

Requires: Admin authentication

**Query Parameters:**
- `status` (optional): `used`, `unused`, `assigned`, `unassigned`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "code": "123456",
      "ticketNo": 1,
      "ticketType": "VIP",
      "isAssigned": true,
      "assignedTo": "Moussa BANE",
      "assignedAt": "2025-12-14T10:30:00Z",
      "isUsed": false,
      "qrUrl": "data:image/png;base64,..."
    }
  ]
}
```

### Get Ticket Stats
**GET** `/admin/tickets/stats/summary`

Requires: Admin or Manager authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 500,
    "assigned": 450,
    "available": 50,
    "used": 200,
    "vip": {
      "total": 90,
      "limit": 90,
      "remaining": 0,
      "used": 85
    },
    "normal": {
      "total": 410,
      "limit": 410,
      "remaining": 0,
      "used": 115
    }
  }
}
```

### Generate Tickets (Sync)
**POST** `/generate-tickets`

Generate tickets immediately. Use for small batches.

Requires: Admin authentication

**Request:**
```json
{
  "count": 200
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "count": 200,
    "totalGenerated": 200,
    "timestamp": "2025-12-14T10:35:00Z"
  },
  "message": "Generated 200 tickets successfully"
}
```

### Generate Tickets (Streaming/SSE)
**GET** `/generate-tickets-stream`

Real-time progress streaming for large batches.

Requires: Admin authentication

**Query Parameters:**
- `count`: Number of tickets (1-1000)
- `token`: JWT token

**Events:**
```javascript
// Event 1: Start
{
  "type": "start",
  "count": 500,
  "timestamp": "2025-12-14T10:35:00Z"
}

// Event 2: Progress (multiple)
{
  "type": "progress",
  "generated": 100,
  "total": 500,
  "progress": 20,
  "batch": 1,
  "timestamp": "2025-12-14T10:35:02Z"
}

// Event 3: Complete
{
  "type": "complete",
  "generated": 500,
  "total": 500,
  "progress": 100,
  "timestamp": "2025-12-14T10:35:10Z"
}
```

### Assign Tickets (Bulk)
**POST** `/admin/tickets/assign-bulk`

Assign multiple unassigned tickets to current user.

Requires: Admin or Manager authentication

**Request:**
```json
{
  "count": 10,
  "ticketType": "VIP"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assigned": 10,
    "ticketType": "VIP",
    "assignedTo": "Moussa BANE"
  }
}
```

### Assign Single Ticket
**PUT** `/admin/tickets/:id/assign`

Assign a single ticket to current user.

Requires: Admin or Manager authentication

**Request:**
```json
{
  "ticketType": "NORMAL"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f...",
    "code": "654321",
    "ticketType": "NORMAL",
    "isAssigned": true,
    "assignedTo": "Moussa BANE",
    "assignedBy": "507f1f77bcf86cd799439011"
  }
}
```

### Validate Ticket
**PUT** `/admin/tickets/:id/validate`

Mark a ticket as used/validated.

Requires: Admin authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f...",
    "isUsed": true,
    "usedAt": "2025-12-14T14:00:00Z"
  }
}
```

### Delete All Tickets
**POST** `/delete-all-tickets`

⚠️ **IRREVERSIBLE** - Deletes ALL tickets and resets counter.

Requires: Admin authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deletedCount": 500
  },
  "message": "500 tickets deleted and counter reset"
}
```

---

## Users

### Get Current User Profile
**GET** `/api/users/me`

Requires: Authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f...",
      "email": "user@example.com",
      "nom": "BANE",
      "prenom": "Moussa",
      "role": "normal"
    }
  }
}
```

### Update Profile
**PUT** `/api/users/me`

Update user information or password.

Requires: Authentication

**Request (update name):**
```json
{
  "nom": "BANE",
  "prenom": "Moussa"
}
```

**Request (change password):**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "user": {...} }
}
```

### Download Ticket Image
**GET** `/api/users/my-tickets/download/:code`

Download assigned ticket as PNG image.

Requires: User must be assigned to ticket

**Query Parameters:**
- `template` (optional): `vip` or `normal` (defaults to ticket type)

**Response (200):**
```
PNG image file (binary)
Content-Type: image/png
```

**Note:** After first download, marks ticket as `isDownloaded: true`

---

## Validation

### Validate Ticket via Code
**GET** `/validate`

Validate a ticket by code (used at event entry).

Requires: Admin or Manager authentication

**Query Parameters:**
- `code`: 6-digit ticket code

**Response (200 - valid):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "_id": "507f...",
      "code": "123456",
      "isUsed": true,
      "usedAt": "2025-12-14T14:00:00Z"
    }
  },
  "message": "Ticket validated successfully"
}
```

**Response (200 - already used):**
```json
{
  "success": true,
  "data": {
    "usedAt": "2025-12-14T12:00:00Z"
  },
  "message": "Ticket already used on 12/14/2025, 12:00:00 PM"
}
```

**Response (404 - not found):**
```json
{
  "success": false,
  "message": "Ticket not found"
}
```

---

## Export

### Export to CSV
**GET** `/admin/export-csv`

Export all tickets as CSV file.

Requires: Admin authentication

**Response (200):**
```csv
_id,code,ticketType,isAssigned,assignedTo,assignedBy,assignedAt,isUsed,usedAt,createdAt
507f...,123456,VIP,true,Moussa BANE,507f...,2025-12-14T10:00:00Z,true,2025-12-14T14:00:00Z,2025-12-14T09:00:00Z
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "details": "Additional error info (if applicable)"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

Currently not enforced, but recommended for production:

```javascript
// Limit login attempts to 5 per 15 minutes
POST /admin/login - 5 requests per 15 min per IP

// Limit ticket generation
POST /generate-tickets - 10 requests per hour per user
```

---

## Headers

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Response Headers
```
Content-Type: application/json
Cache-Control: no-cache (for sensitive endpoints)
X-Request-ID: <unique-id>
```

---

## Pagination

Not currently implemented, but can be added:

```javascript
GET /admin/tickets?page=1&limit=20
```

---

## WebSocket Support

Currently using Server-Sent Events (SSE) for real-time updates.

Consider implementing WebSocket for bidirectional communication.

---

**Last Updated:** December 14, 2025
