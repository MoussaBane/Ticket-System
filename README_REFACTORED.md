# 🎫 Ticket Management System v5.0

A professional, production-ready event ticket management system with complete frontend/backend separation, JWT authentication, role-based access control, QR code generation, and MongoDB integration.

## 🚀 Features

### Core Functionality
- ✅ **Bulk Ticket Generation**: Generate up to 1000 tickets at once
- ✅ **Ticket Validation**: QR code scanning and validation
- ✅ **Role-Based Access**: Admin, Manager, and Normal user roles
- ✅ **Ticket Types**: VIP (limit 90) and NORMAL (limit 410) with quotas
- ✅ **User Management**: Create, update, delete, and manage users
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Rate Limiting**: Protection against brute force attacks

### Technical Highlights
- 📦 **Modular Architecture**: Clear separation of concerns
- 🔐 **Security**: bcrypt password hashing, JWT tokens, CORS
- 🗄️ **Database**: MongoDB with Mongoose ODM
- 🎯 **RESTful API**: Standardized JSON responses
- 📱 **Responsive UI**: Bootstrap 5 frontend
- ⚡ **Performance**: Batch processing for bulk operations

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── env.js       # Environment variables
│   │   │   ├── database.js  # MongoDB connection
│   │   │   └── constants.js # App constants
│   │   │
│   │   ├── routes/          # API route definitions
│   │   │   ├── auth.js      # Authentication routes
│   │   │   ├── tickets.js   # Ticket routes
│   │   │   └── users.js     # User management routes
│   │   │
│   │   ├── controllers/      # HTTP request handlers
│   │   │   ├── authController.js
│   │   │   ├── ticketController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── services/         # Business logic
│   │   │   ├── authService.js
│   │   │   ├── ticketService.js
│   │   │   ├── userService.js
│   │   │   └── counterService.js
│   │   │
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── Ticket.js
│   │   │   ├── User.js
│   │   │   ├── Counter.js
│   │   │   └── Reservation.js
│   │   │
│   │   ├── middlewares/      # Express middlewares
│   │   │   ├── verifyToken.js
│   │   │   ├── roleAuth.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── utils/            # Utility functions
│   │   │   ├── jwtUtils.js
│   │   │   ├── responseUtils.js
│   │   │   ├── logger.js
│   │   │   └── validators.js
│   │   │
│   │   └── app.js            # Express app configuration
│   │
│   └── server.js             # Server entry point
│
├── frontend/
│   ├── pages/                # HTML pages
│   │   └── index.html        # Login page
│   │
│   ├── components/           # Reusable components (future)
│   │
│   ├── assets/               # Static assets
│   │   ├── images/
│   │   │   ├── logo.jpg
│   │   │   ├── background.png
│   │   │   └── tickets/
│   │   └── icons/
│   │
│   ├── css/                  # Stylesheets
│   │   ├── main.css          # Main styles
│   │   └── responsive.css    # Responsive design
│   │
│   ├── js/                   # JavaScript
│   │   ├── api-client.js     # HTTP client
│   │   ├── main.js           # Initialization
│   │   ├── services/         # Service classes
│   │   │   ├── auth-service.js
│   │   │   ├── ticket-service.js
│   │   │   └── user-service.js
│   │   ├── utils/            # Utilities
│   │   │   ├── notifications.js
│   │   │   ├── storage.js
│   │   │   └── validators.js
│   │   └── pages/            # Page-specific scripts (future)
│   │
│   └── index.html            # Main login page (or symlink)
│
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .gitignore                # Git ignore patterns
├── REFACTORING_PLAN.md       # Refactoring documentation
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** >=16.0.0
- **Express.js** ^5.1.0 - Web framework
- **MongoDB** via Mongoose ^8.14.0 - Database
- **JWT** (jose) - Authentication
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin support

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Bootstrap 5** - UI components
- **Vanilla JavaScript** - No framework dependencies
- **Fetch API** - HTTP requests

## 📦 Installation

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)

### Steps

1. **Clone and Setup**
```bash
# Clone repository
git clone <repo-url>
cd ticket-system

# Install dependencies
npm install
```

2. **Configure Environment**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# - Set MongoDB URI or credentials
# - Generate secure JWT_SECRET (32+ characters)
# - Configure other variables as needed
```

3. **Start Backend**
```bash
# Development with auto-reload
npm run dev

# Or production
npm start
```

4. **Access Frontend**
```
Browser: http://localhost:3000
```

## 🔐 Authentication

### Default Credentials (Demo)
- **Admin**: admin@example.com / AdminPass123
- **Manager**: manager@example.com / ManagerPass123

### Security Features
- JWT-based token authentication
- bcrypt password hashing (salt rounds: 12)
- Rate limiting: 5 login attempts per 15 minutes
- Token expiration: 3 hours (configurable)
- Role-based access control (RBAC)

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login           # Login
POST   /api/auth/register        # Register user
```

### Tickets
```
POST   /api/tickets/generate     # Generate bulk tickets
POST   /api/tickets/validate     # Validate ticket
POST   /api/tickets/assign       # Assign single ticket
POST   /api/tickets/assign-bulk  # Assign multiple tickets
GET    /api/tickets/stats        # Get statistics
```

### Users (Admin Only)
```
GET    /api/users                # List all users
POST   /api/users                # Create user
GET    /api/users/:id            # Get user
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user
POST   /api/users/:id/reset-password  # Reset password
```

### Health
```
GET    /health                   # Health check
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* detailed errors */ ],
  "statusCode": 400
}
```

## 🧑‍💻 Development

### Scripts
```bash
npm start           # Start production server
npm run dev         # Start with auto-reload
npm run backend     # Start backend only
npm run backend:dev # Backend with nodemon
```

### Code Structure Principles
- **Routes**: Only route definitions and middleware composition
- **Controllers**: HTTP request/response handling
- **Services**: Business logic and data operations
- **Middlewares**: Cross-cutting concerns
- **Models**: Data schema definitions
- **Utils**: Reusable helper functions

## 🚀 Deployment

### Environment Variables Required
```bash
# Essential
NODE_ENV=production
PORT=3000
DB_URI=<production-mongodb-uri>
JWT_SECRET=<secure-random-32+-chars>

# Optional
JWT_EXPIRES_IN=3h
```

### Recommended Deployment
- Use Node.js process manager (PM2, Forever)
- Set up HTTPS/SSL
- Use environment-specific .env files
- Monitor logs and errors
- Regular database backups
- Rate limiting on production

## 📝 Improvements Since v4.1

### Architecture
✅ Complete frontend/backend separation  
✅ Clear MVC-like architecture (routes → controllers → services)  
✅ Centralized configuration  
✅ Standardized error handling  
✅ Centralized logging  

### Code Quality
✅ Modular, testable code  
✅ Reusable service layer  
✅ Consistent naming conventions  
✅ Removed code duplication  
✅ Better code organization  

### Frontend
✅ Centralized API client  
✅ Service-oriented design  
✅ Utility functions library  
✅ Responsive login page  
✅ Better asset organization  

### Dependencies
✅ Removed `express-session` (unused)  
✅ Removed `html5-qrcode` from backend  
✅ Optimized dependencies  
✅ Updated to latest stable versions  

### Documentation
✅ Detailed project structure  
✅ API documentation  
✅ Installation guide  
✅ Environment setup  

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify connection string in .env
- Check MongoDB is running
- Verify credentials and network access
- Check IP whitelist if using Atlas

### JWT_SECRET Error
```
Error: JWT_SECRET not configured or too short
```
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Set in .env file (32+ characters)

### Port Already in Use
```bash
# Change PORT in .env or
# Find process: lsof -i :3000
# Kill process: kill -9 <PID>
```

### CORS Issues
- Verify frontend URL in CORS configuration
- Check browser console for specific error
- Enable CORS in backend (already configured)

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB/Mongoose](https://mongoosejs.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Guidelines](https://owasp.org)

## 📄 License

ISC License - See LICENSE file for details

## 👨‍💻 Author

Moussa BANE

---

**Last Updated**: December 2025  
**Version**: 5.0.0 (Refactored)
