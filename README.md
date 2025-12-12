# 🎫 Ticket Management System

A comprehensive event ticket management system built with Node.js, Express, and MongoDB. Features secure JWT authentication, role-based access control, PDF ticket generation, QR code validation, and email delivery.

## 🚀 Features

### 🎟️ Ticket Management

- **Bulk Ticket Generation**: Generate up to 1000 tickets at once
- **Unique Code System**: Each ticket has a unique 8-digit code
- **QR Code Integration**: Automatic QR code generation for each ticket
- **PDF Generation**: Generate beautiful PDF tickets with Puppeteer (A6 size)
- **Ticket Assignment**: Assign tickets to individuals with tracking
- **Status Tracking**: Monitor usage and assignment status

### 🔐 Security & Authentication

- **JWT-based Authentication**: Secure token-based API authentication
- **Role-Based Access Control**: Admin, Manager, and Normal user roles
- **Password Encryption**: Industry-standard bcrypt password hashing
- **Rate Limiting**: Protection against brute force attacks (5 attempts/15 min)
- **Token Verification**: Secure API endpoint protection with middleware

### 👥 User Management

- **Role System**: Admin (full access), Manager (limited access), Normal (read-only)
- **User Profiles**: Update profile information and passwords
- **Admin Controls**: Create users, assign roles, reset passwords

### 📊 Reservation Management

- **Reservation Workflow**: PENDING → TICKET_CREATED → TICKET_SENT
- **Bulk Import**: Import reservations from CSV files
- **CSV Export**: Export ticket data to CSV format
- **Email Delivery**: Send PDF tickets via email with customizable templates

### 📱 User Interface

- **Responsive Design**: Bootstrap 5 responsive UI
- **Admin Dashboard**: Comprehensive ticket and user management interface
- **Manager Interface**: Simplified interface for creating and importing reservations
- **Real-time Validation**: Instant feedback on user actions

## 🛠️ Technology Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (jose)** - Authentication tokens
- **Puppeteer** - PDF generation
- **Nodemailer** - Email delivery

### Frontend

- **HTML5** - Markup
- **CSS3** - Styling with Bootstrap 5
- **JavaScript** - Client-side logic
- **QR Code Libraries** - html5-qrcode, qrcode

## 📋 Prerequisites

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **MongoDB** (Atlas or local instance)
- **SMTP Email Service** (Gmail, SendGrid, etc.)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ticket-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Database
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticket_system

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=3h

# Email
MAIL_SERVICE=gmail
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_NAME=Event Team
```

### 4. Seed Database with Default Users

```bash
npm run seed:users
```

Default credentials:

- **Admin**: `admin@example.com` / `AdminPass123`
- **Manager**: `manager@example.com` / `ManagerPass123`

### 5. Start the Server

```bash
npm start
```

Server will run at `http://localhost:3000`

## 📖 API Documentation

### Authentication Routes

#### POST /admin/login

Login with email and password.

```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "AdminPass123"}'
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": "...", "email": "...", "role": "admin" }
  }
}
```

#### POST /admin/register

Create a new user account.

```bash
curl -X POST http://localhost:3000/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "John",
    "prenom": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "manager"
  }'
```

### Ticket Routes (Admin Only)

#### GET /admin/tickets

List all tickets with optional filtering.

```bash
curl -X GET "http://localhost:3000/admin/tickets?status=used" \
  -H "Authorization: Bearer <token>"
```

Query parameters:

- `status`: `used`, `unused`, `assigned`, `unassigned`

#### POST /generate-tickets

Generate new tickets.

```bash
curl -X POST http://localhost:3000/generate-tickets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 200}'
```

#### PUT /admin/tickets/:id

Update ticket properties.

```bash
curl -X PUT http://localhost:3000/admin/tickets/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isUsed": true, "isAssigned": true, "assignedTo": "John Doe"}'
```

#### PUT /admin/tickets/:id/validate

Mark ticket as used.

```bash
curl -X PUT http://localhost:3000/admin/tickets/<id>/validate \
  -H "Authorization: Bearer <token>"
```

#### DELETE /tickets/:id

Delete a single ticket.

```bash
curl -X DELETE http://localhost:3000/tickets/<id> \
  -H "Authorization: Bearer <token>"
```

#### GET /admin/export-csv

Export all tickets as CSV.

```bash
curl -X GET http://localhost:3000/admin/export-csv \
  -H "Authorization: Bearer <token>" > tickets.csv
```

### Reservation Routes (Manager/Admin)

#### POST /api/manager/reservations

Create a single reservation.

```bash
curl -X POST http://localhost:3000/api/manager/reservations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "buyerName": "Jane Smith",
    "buyerEmail": "jane@example.com",
    "buyerPhone": "+1234567890",
    "holderName": "John Smith",
    "holderEmail": "john@example.com"
  }'
```

#### POST /api/manager/import-reservations

Import reservations from CSV.

```bash
curl -X POST http://localhost:3000/api/manager/import-reservations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: text/plain" \
  -d @reservations.csv
```

CSV Format:

```
buyerName,buyerEmail,buyerPhone,holderName,holderEmail
John Doe,john@example.com,+1234567890,John Doe,john@example.com
Jane Smith,jane@example.com,+0987654321,Jane Smith,jane@example.com
```

#### GET /api/manager/reservations

List reservations (managers see their own, admins see all).

```bash
curl -X GET http://localhost:3000/api/manager/reservations \
  -H "Authorization: Bearer <token>"
```

### Admin Reservation Routes

#### POST /api/admin/generate-tickets-from-reservations

Generate tickets from PENDING reservations.

```bash
curl -X POST http://localhost:3000/api/admin/generate-tickets-from-reservations \
  -H "Authorization: Bearer <token>"
```

#### POST /api/admin/send-tickets-from-reservations

Send emails for TICKET_CREATED reservations.

```bash
curl -X POST http://localhost:3000/api/admin/send-tickets-from-reservations \
  -H "Authorization: Bearer <token>"
```

### User Routes

#### GET /api/users/me

Get current user profile.

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>"
```

#### PUT /api/users/me

Update user profile or change password.

```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "John",
    "prenom": "Doe",
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword123"
  }'
```

#### GET /api/users (Admin Only)

List all users.

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"
```

#### PUT /api/users/:id/role (Admin Only)

Change user role.

```bash
curl -X PUT http://localhost:3000/api/users/<id>/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "manager"}'
```

## 📁 Project Structure

```
ticket-system/
├── index.js                 # Main server file
├── package.json             # Dependencies
├── .env.example             # Environment template
├── README.md                # This file
│
├── middlewares/
│   ├── adminAuth.js         # Admin-only middleware
│   ├── verifyToken.js       # JWT verification
│   └── roleAuth.js          # Role-based authorization
│
├── models/
│   ├── User.js              # User schema
│   ├── Ticket.js            # Ticket schema
│   └── Reservation.js       # Reservation schema
│
├── routes/
│   ├── auth.js              # Login/Register routes
│   ├── admin.js             # Admin routes
│   ├── manager.js           # Manager routes
│   └── users.js             # User management routes
│
├── services/
│   ├── mailService.js       # Email sending
│   └── ticketPdfService.js  # PDF generation
│
├── utils/
│   ├── jwtUtils.js          # JWT utilities
│   └── responseUtils.js     # Standardized responses
│
├── scripts/
│   └── seedUsers.js         # Database seeding
│
├── views/
│   └── ticket.ejs           # PDF ticket template
│
└── public/
    ├── admin.html           # Admin dashboard
    ├── admin-auth.html      # Login/Register page
    ├── manager.html         # Manager interface
    ├── profile.html         # User profile
    ├── users.html           # User management
    ├── scan.html            # QR code scanner
    ├── logo.jpg             # Logo
    └── background.png       # Background image
```

## 🔐 Security Considerations

1. **JWT_SECRET**: Change to a strong random string in production
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Use MongoDB Atlas with IP whitelisting
4. **Email Credentials**: Use app-specific passwords for email services
5. **Rate Limiting**: Already configured for login endpoint
6. **CORS**: Configure for your specific domain in production

## 🚀 Deployment

### Environment Setup for Production

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<long-random-string>
DB_URI=<mongodb-atlas-uri>
MAIL_SERVICE=gmail
MAIL_USER=<your-email>
MAIL_PASS=<app-password>
```

### Deploy to Heroku

```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Deploy to Render

```bash
# Connect your GitHub repository to Render
# Set environment variables in dashboard
# Deploy from Render dashboard
```

## 🐛 Troubleshooting

### MongoDB Connection Error

- Verify DB_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Email Not Sending

- Verify MAIL_USER and MAIL_PASS
- For Gmail: Enable 2FA and use App Password
- Check firewall/SMTP port 587

### PDF Generation Issues

- Ensure Puppeteer is installed: `npm install puppeteer`
- Check server has sufficient memory
- Verify ticket.ejs template exists

### JWT Token Expired

- Increase JWT_EXPIRES_IN if needed
- Users need to re-login after expiration

## 📊 Database Schemas

### User

```javascript
{
  nom: String,
  prenom: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "manager" | "normal",
  createdAt: Date
}
```

### Ticket

```javascript
{
  code: String (unique, 6 digits),
  isUsed: Boolean,
  isAssigned: Boolean,
  assignedTo: String,
  assignedEmail: String,
  assignedAt: Date,
  usedAt: Date,
  reservationId: ObjectId,
  pdfUrl: String,
  qrData: String,
  sent: Boolean,
  sentAt: Date,
  createdAt: Date
}
```

### Reservation

```javascript
{
  eventId: ObjectId,
  buyerName: String,
  buyerEmail: String,
  buyerPhone: String,
  holderName: String,
  holderEmail: String,
  ticketId: ObjectId,
  status: "PENDING" | "TICKET_CREATED" | "TICKET_SENT",
  createdBy: ObjectId,
  createdAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

ISC License - See LICENSE file for details

## 👨‍💻 Author

**Moussa BANE** - Initial development and maintenance

## 📞 Support

For issues, questions, or suggestions:

1. Check existing issues on GitHub
2. Create detailed issue with reproduction steps
3. Contact: <moussa.bane@example.com>

## 🗺️ Roadmap

- [ ] Two-factor authentication (2FA)
- [ ] SMS notifications for ticket delivery
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Payment integration
- [ ] Barcode scanner support
- [ ] Event scheduling system

---

**Last Updated**: December 2024
**Version**: 1.0.0

- **express-rate-limit** - Rate limiting
- **validator** - Data validation
- **cors** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MoussaBane/Ticket-System.git
   cd Ticket-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   DB_USERNAME=your_mongodb_username
   DB_PASSWORD=your_mongodb_password
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Connection**
   
   Update the MongoDB connection string in `index.js` if needed:
   ```javascript
   const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pznxahw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run serve
# or
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🧭 Roles & Workflow

This project now supports two roles: `admin` and `manager` with a reservation->ticket workflow:

- **Manager**: create reservations (single or CSV import) for paid purchases. Managers cannot generate tickets or send emails.
- **Admin**: review reservations, generate tickets (code + QR + PDF) from `PENDING` reservations, and send tickets by email. Admins also keep full access to ticket management and exports.

## 🔁 Ticket Workflow (Admin & Manager)

```mermaid
flowchart LR
   subgraph Managers
      M[Manager] --> M1[Create single reservation<br/>(manual form)]
      M --> M2[Import reservations<br/>(CSV file)]
   end

   M1 --> R[Reservation (PENDING)]
   M2 --> R

   subgraph Admins
      A[Admin] --> A1[View all reservations]
      A --> A2[Generate tickets<br/>from PENDING reservations]
      A --> A3[Send tickets<br/>by email]
   end

   R -->|PENDING| G[Generate Tickets]
   G --> T[Ticket created<br/>(code + QR + PDF)]
   G --> R2[Reservation status = TICKET_CREATED]

   A3 --> S[Email sent to holder]
   S --> T2[Ticket.sent = true]
   S --> R3[Reservation status = TICKET_SENT]

   subgraph Participants
      H[Ticket Holder] --> DL[Open email or link]
      DL --> QR[Download ticket PDF<br/>with QR code]
      QR --> USE[Use ticket at event<br/>(scan code/QR)]
   end
```

## 🧬 Data Model Relations

```mermaid
erDiagram
   USER {
      string nom
      string prenom
      string email
      string password
      string role  "admin | manager"
      date   createdAt
   }

   RESERVATION {
      string buyerName
      string buyerEmail
      string buyerPhone
      string holderName
      string holderEmail
      string status        "PENDING | TICKET_CREATED | TICKET_SENT"
      date   createdAt
   }

   TICKET {
      string code
      boolean isUsed
      boolean isAssigned
      string assignedTo
      string assignedEmail
      string pdfUrl
      string qrData
      boolean sent
      date   sentAt
      date   assignedAt
      date   usedAt
      date   createdAt
   }

   USER ||--o{ RESERVATION : "createdBy"
   RESERVATION }o--|| TICKET : "ticketId"
```

## 📱 Usage

### Admin Access
1. Navigate to `/admin-auth.html` for admin login
2. Create an admin account through the registration system
3. Access the admin dashboard at `/admin.html`

### Ticket Validation
1. Use the main interface at `/index.html` for ticket validation
2. Enter ticket codes manually or use the QR scanner at `/qr-scanner.html`
3. Get real-time validation results

## 🔗 API Endpoints

### Authentication
- `POST /admin/login` - Admin login
- `POST /admin/register` - Admin registration

### Ticket Management
- `POST /generate-tickets` - Generate 200 tickets (Admin only)
- `GET /validate?code={code}` - Validate ticket by code
- `POST /validate-ticket` - Validate ticket via QR code
- `GET /admin/tickets` - List all tickets (Admin only)
- `GET /admin/tickets/:id` - Get specific ticket (Admin only)
- `PUT /admin/tickets/:id` - Update ticket (Admin only)
- `PUT /admin/tickets/:id/assign` - Assign ticket (Admin only)
- `PUT /admin/tickets/:id/validate` - Validate ticket (Admin only)
- `DELETE /tickets/:id` - Delete specific ticket (Admin only)
- `POST /delete-all-tickets` - Delete all tickets (Admin only)
- `GET /admin/export-csv` - Export tickets to CSV (Admin only)

## 📊 Data Models

### Ticket Schema
```javascript
{
  code: String,           // Unique 8-digit code
  isUsed: Boolean,        // Ticket usage status
  isAssigned: Boolean,    // Assignment status
  assignedTo: String,     // Person assigned to
  assignedAt: Date,       // Assignment timestamp
  usedAt: Date,          // Usage timestamp
  createdAt: Date        // Creation timestamp
}
```

### User Schema
```javascript
{
  nom: String,           // Last name
  prenom: String,        // First name
  email: String,         // Email address
  password: String,      // Encrypted password
  role: String,          // User role
  createdAt: Date       // Creation timestamp
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 5 login attempts per 15 minutes
- **Password Encryption**: bcrypt with salt rounds
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request handling

## 🚀 Deployment

### Render.com Deployment
The project includes a `render.yaml` configuration for easy deployment on Render:

```yaml
services:
  - type: web
    name: ticket-system
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node index.js
```

### Manual Deployment Steps
1. Set up environment variables on your hosting platform
2. Configure MongoDB connection
3. Deploy the application
4. Run `npm install` to install dependencies
5. Start with `node index.js`

## 📁 Project Structure

```
ticket-system/
├── middlewares/
│   ├── adminAuth.js      # Admin authentication middleware
│   └── verifyToken.js    # JWT token verification
├── models/
│   ├── Ticket.js         # Ticket data model
│   └── User.js           # User data model
├── public/
│   ├── admin-auth.html   # Admin login page
│   ├── admin.html        # Admin dashboard
│   ├── index.html        # Main validation page
│   ├── qr-scanner.html   # QR code scanner
│   ├── scan.html         # Scan results page
│   └── assets/           # Static assets
├── routes/
│   └── auth.js           # Authentication routes
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── render.yaml           # Render deployment config
└── README.md             # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**MoussaBane**
- GitHub: [@MoussaBane](https://github.com/MoussaBane)

## 🙏 Acknowledgments

- Bootstrap team for the responsive CSS framework
- MongoDB team for the excellent database solution
- Express.js community for the robust web framework
- All contributors who help improve this project

## 📞 Support

For support, please open an issue on GitHub or contact the maintainer.

---

⭐ If this project helped you, please give it a star on GitHub!
