# 🎫 Ticket Management System

A comprehensive event ticket management system built with Node.js, Express, and MongoDB. This system provides secure ticket generation, validation, and management capabilities with QR code support and admin authentication.

## 🚀 Features

### 🎟️ Ticket Management
- **Bulk Ticket Generation**: Generate up to 200 tickets at once
- **Unique Code System**: Each ticket has a unique 8-digit code
- **QR Code Integration**: Automatic QR code generation for each ticket
- **Ticket Assignment**: Assign tickets to specific individuals
- **Usage Tracking**: Track ticket usage status and timestamps

### 🔐 Security & Authentication
- **Admin Authentication**: Secure JWT-based admin authentication
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)
- **Password Encryption**: bcrypt password hashing
- **Token Verification**: Secure API endpoint protection

### 📱 User Interface
- **Responsive Design**: Bootstrap-powered responsive UI
- **QR Code Scanner**: Built-in QR code scanning functionality
- **Real-time Validation**: Instant ticket validation feedback
- **Admin Dashboard**: Comprehensive ticket management interface

### 📊 Data Management
- **CSV Export**: Export ticket data to CSV format
- **Filtering**: Filter tickets by status (used/unused, assigned/unassigned)
- **Real-time Updates**: Live ticket status updates
- **Database Integration**: MongoDB with Mongoose ODM

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt/bcryptjs** - Password hashing

### Frontend
- **HTML5** - Markup
- **Bootstrap 5** - CSS framework
- **JavaScript** - Client-side functionality
- **html5-qrcode** - QR code scanning

### Additional Libraries
- **QRCode** - QR code generation
- **json2csv** - CSV export functionality
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
