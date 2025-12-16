# 📂 Arborescence Complète du Projet - Ticket System v5.0

## Structure Globale

```
ticket-system/
│
├── 📁 backend/                          # Serveur Node.js + API
│   ├── 📁 src/                          # Code source
│   │   ├── 📁 config/                   # Configuration
│   │   │   ├── 📄 env.js               # Variables d'environnement
│   │   │   ├── 📄 database.js          # Connexion MongoDB
│   │   │   └── 📄 constants.js         # Constantes applicatives
│   │   │
│   │   ├── 📁 routes/                   # Définition des routes
│   │   │   ├── 📄 auth.js              # Routes d'authentification
│   │   │   ├── 📄 tickets.js           # Routes des tickets
│   │   │   └── 📄 users.js             # Routes de gestion utilisateurs
│   │   │
│   │   ├── 📁 controllers/              # Logique HTTP
│   │   │   ├── 📄 authController.js    # Authentification
│   │   │   ├── 📄 ticketController.js  # Gestion tickets
│   │   │   └── 📄 userController.js    # Gestion utilisateurs
│   │   │
│   │   ├── 📁 services/                 # Logique métier
│   │   │   ├── 📄 authService.js       # Service auth
│   │   │   ├── 📄 ticketService.js     # Service tickets
│   │   │   ├── 📄 userService.js       # Service utilisateurs
│   │   │   └── 📄 counterService.js    # Service compteurs
│   │   │
│   │   ├── 📁 models/                   # Schémas Mongoose
│   │   │   ├── 📄 User.js              # Modèle utilisateur
│   │   │   ├── 📄 Ticket.js            # Modèle ticket
│   │   │   ├── 📄 Counter.js           # Modèle compteur
│   │   │   └── 📄 Reservation.js       # Modèle réservation
│   │   │
│   │   ├── 📁 middlewares/              # Middlewares Express
│   │   │   ├── 📄 verifyToken.js       # Vérification JWT
│   │   │   ├── 📄 roleAuth.js          # Autorisation par rôle
│   │   │   └── 📄 errorHandler.js      # Gestion centralisée erreurs
│   │   │
│   │   ├── 📁 utils/                    # Utilitaires
│   │   │   ├── 📄 jwtUtils.js          # Gestion JWT
│   │   │   ├── 📄 responseUtils.js     # Format réponses standard
│   │   │   ├── 📄 logger.js            # Logging structuré
│   │   │   └── 📄 validators.js        # Validation données
│   │   │
│   │   └── 📄 app.js                    # Configuration Express
│   │
│   └── 📄 server.js                     # Point d'entrée (démarrage)
│
├── 📁 frontend/                         # Interface utilisateur
│   ├── 📁 pages/                        # Pages HTML
│   │   └── 📄 index.html               # Page de login
│   │
│   ├── 📁 js/                           # JavaScript
│   │   ├── 📄 api-client.js            # Client HTTP centralisé
│   │   ├── 📄 main.js                  # Initialisation globale
│   │   │
│   │   ├── 📁 services/                 # Services métier
│   │   │   ├── 📄 auth-service.js      # Service authentification
│   │   │   ├── 📄 ticket-service.js    # Service tickets
│   │   │   └── 📄 user-service.js      # Service utilisateurs
│   │   │
│   │   ├── 📁 utils/                    # Utilitaires
│   │   │   ├── 📄 notifications.js     # Notifications/toasts
│   │   │   ├── 📄 storage.js           # Wrapper localStorage
│   │   │   └── 📄 validators.js        # Validation côté client
│   │   │
│   │   └── 📁 pages/                    # Scripts par page
│   │       └── (future: admin.js, manager.js, etc.)
│   │
│   ├── 📁 css/                          # Feuilles de style
│   │   ├── 📄 main.css                 # Styles principaux
│   │   └── 📄 responsive.css           # Design réactif
│   │
│   ├── 📁 assets/                       # Ressources statiques
│   │   ├── 📁 images/
│   │   │   ├── 📄 logo.jpg             # Logo
│   │   │   ├── 📄 background.png       # Fond d'écran
│   │   │   └── 📁 tickets/             # Images tickets
│   │   └── 📁 icons/                    # Icônes
│   │
│   └── 📄 index.html                    # Page d'accueil (login)
│
├── 📁 scripts/                          # Scripts utilitaires (legacy)
│   ├── 📄 seedUsers.js                 # Seed utilisateurs
│   ├── 📄 checkTickets.js              # Vérification tickets
│   └── ...
│
├── 📁 docs/                             # Documentation
│   ├── 📄 API.md
│   ├── 📄 ARCHITECTURE.md
│   └── ...
│
├── 📁 public/                           # Assets public (legacy)
│   ├── 📄 admin.html
│   ├── 📄 manager.html
│   ├── 📄 index.html
│   └── ...
│
├── 📄 package.json                      # Dépendances Node
├── 📄 .env                              # Variables env (NE PAS COMMITTER)
├── 📄 .env.example                      # Template .env
├── 📄 .gitignore                        # Fichiers ignorés Git
├── 📄 README.md                         # Documentation principale
├── 📄 README_REFACTORED.md              # Documentation refactorisée
├── 📄 QUICKSTART.md                     # Guide démarrage rapide
├── 📄 REFACTORING_PLAN.md               # Plan technique
├── 📄 REFACTORING_SUMMARY.md            # Résumé exécutif
├── 📄 VALIDATION_CHECKLIST.md           # Checklist validation
└── 📄 index.js                          # Ancien point d'entrée (legacy)
```

---

## 📊 Détail par Domaine

### Backend - Configuration (4 fichiers)
```
backend/src/config/
├── env.js              ← Gestion variables environnement
├── database.js         ← Connexion MongoDB
└── constants.js        ← Constantes (rôles, types, etc.)
```

### Backend - Routes (3 fichiers)
```
backend/src/routes/
├── auth.js             ← POST /api/auth/login|register
├── tickets.js          ← GET|POST /api/tickets/*
└── users.js            ← GET|POST|PUT|DELETE /api/users/*
```

### Backend - Controllers (3 fichiers)
```
backend/src/controllers/
├── authController.js   ← login(), register()
├── ticketController.js ← generateTickets(), validateTicket(), etc.
└── userController.js   ← getAllUsers(), createUser(), etc.
```

### Backend - Services (4 fichiers)
```
backend/src/services/
├── authService.js      ← Logique authentification
├── ticketService.js    ← Logique gestion tickets
├── userService.js      ← Logique gestion utilisateurs
└── counterService.js   ← Logique compteurs
```

### Backend - Models (4 fichiers)
```
backend/src/models/
├── User.js             ← Schéma utilisateur
├── Ticket.js           ← Schéma ticket
├── Counter.js          ← Schéma compteur
└── Reservation.js      ← Schéma réservation
```

### Backend - Middlewares (3 fichiers)
```
backend/src/middlewares/
├── verifyToken.js      ← Vérification JWT
├── roleAuth.js         ← Autorisation par rôle
└── errorHandler.js     ← Gestion erreurs globales
```

### Backend - Utils (4 fichiers)
```
backend/src/utils/
├── jwtUtils.js         ← Génération/validation tokens
├── responseUtils.js    ← Format réponses standard
├── logger.js           ← Logging structuré
└── validators.js       ← Validation données
```

### Frontend - JavaScript (6+ fichiers)
```
frontend/js/
├── api-client.js                    ← Client HTTP
├── main.js                          ← Initialisation
├── services/
│   ├── auth-service.js             ← Service auth
│   ├── ticket-service.js           ← Service tickets
│   └── user-service.js             ← Service users
└── utils/
    ├── notifications.js            ← Notifications
    └── storage.js                  ← Stockage local
```

### Frontend - CSS (2 fichiers)
```
frontend/css/
├── main.css            ← Styles principaux
└── responsive.css      ← Design réactif
```

### Frontend - Pages & Assets
```
frontend/
├── pages/index.html    ← Page login
├── assets/
│   ├── images/
│   │   ├── logo.jpg
│   │   ├── background.png
│   │   └── tickets/
│   └── icons/
└── (futurs: components/, partials/)
```

---

## 📈 Statistiques

| Catégorie | Nombre | Notes |
|-----------|--------|-------|
| **Fichiers Backend** | 28 | Routes, Controllers, Services, Models, Utils, Config |
| **Fichiers Frontend** | 12 | Pages, Services, Utils, CSS |
| **Fichiers Configuration** | 5 | package.json, .env*, README, etc. |
| **Fichiers Documentation** | 7 | REFACTORING_*, QUICKSTART, README_* |
| **Total Nouveaux** | ~40 | Fichiers créés/refactorisés |
| **Dépendances** | 11 | Express, Mongoose, bcrypt, JWT, etc. |
| **Lignes Backend** | ~1200 | Bien structuré, modularisé |
| **Lignes Frontend** | ~600 | Vanilla JS, services réutilisables |

---

## 🗂️ Hiérarchie d'Importations

### Backend
```
server.js
  └── app.js
       ├── routes/*
       │   └── controllers/*
       │        └── services/*
       │             ├── models/*
       │             └── utils/*
       ├── middlewares/*
       │   └── utils/*
       └── config/*
```

### Frontend
```
index.html
  ├── api-client.js
  ├── services/*
  │   └── api-client.js
  ├── utils/*
  └── main.js
       ├── services/*
       └── utils/*
```

---

## 🔄 Flux de Données

### Request API
```
Frontend (HTML)
  ↓
Event Listener / Form Submit
  ↓
Service (auth-service, ticket-service, etc.)
  ↓
APIClient.post() / .get() / etc.
  ↓
Backend Route (routes/auth.js, etc.)
  ↓
Controller (controllers/authController.js)
  ↓
Service (services/authService.js)
  ↓
Model (models/User.js, etc.)
  ↓
Database (MongoDB)
```

### Response Flow
```
Database Result
  ↓
Service Processing
  ↓
Controller Formatting
  ↓
Response Middleware (formatage standard)
  ↓
Frontend (JSON parsed)
  ↓
Service Handler
  ↓
Notification / UI Update
```

---

## 📋 Points d'Entrée

| Type | Path | Description |
|------|------|-------------|
| **Backend** | `backend/server.js` | Démarrage du serveur |
| **Frontend** | `frontend/pages/index.html` | Page d'accueil (login) |
| **Config** | `.env` | Variables d'environnement |
| **Scripts** | `scripts/*` | Scripts utilitaires |

---

## 🔐 Couches de Sécurité

```
┌─────────────────────────────────┐
│   Frontend (HTML/JS/CSS)        │
├─────────────────────────────────┤
│   API Client + Middleware       │
│   - JWT Token Storage           │
│   - CORS Headers                │
├─────────────────────────────────┤
│   verifyToken Middleware        │
│   - JWT Verification            │
├─────────────────────────────────┤
│   roleAuth Middleware           │
│   - Role Checking               │
├─────────────────────────────────┤
│   Controllers                   │
│   - Input Validation            │
├─────────────────────────────────┤
│   Services                      │
│   - Business Logic              │
│   - Data Validation             │
├─────────────────────────────────┤
│   Models                        │
│   - Mongoose Validation         │
│   - Type Checking               │
├─────────────────────────────────┤
│   Database (MongoDB)            │
│   - Access Control              │
│   - Encryption at Rest          │
└─────────────────────────────────┘
```

---

## 🎯 Chemins d'Exécution

### Cas 1 : Authentification
```
index.html form submit
  → api-client.post('/api/auth/login')
    → auth.js route
      → authController.login()
        → authService.login()
          → User.findOne() (MongoDB)
          → password comparison
          → generateToken()
          → return { token, user }
```

### Cas 2 : Génération de Tickets
```
admin.html button click
  → ticketService.generateTickets()
    → api-client.post('/api/tickets/generate')
      → tickets.js route (+ auth middleware)
        → ticketController.generateTickets()
          → ticketService.generateTickets()
            → batch processing (100 tickets/batch)
            → Ticket.insertMany()
            → return { count, ticketType, stats }
```

### Cas 3 : Gestion Utilisateurs
```
admin.html user form
  → userService.createUser()
    → api-client.post('/api/users')
      → users.js route (+ admin auth)
        → userController.createUser()
          → userService.createUser()
            → validation
            → User.save() (password hashing)
            → return user
```

---

## 🚀 Déploiement

### Structure Déploiement
```
production/
├── backend/          ← Node.js app
├── frontend/         ← Static files (nginx/CDN)
├── .env              ← Production secrets
└── package.json
```

### Environnement Production
```
NODE_ENV=production
PORT=3000 (ou port du serveur)
DB_URI=<production mongodb>
JWT_SECRET=<32+ chars secure>
```

---

## 📦 Dépendances

### Dependencies
```json
{
  "bcryptjs": "password hashing",
  "cors": "cross-origin requests",
  "dotenv": "environment variables",
  "express": "web framework",
  "express-rate-limit": "api rate limiting",
  "jimp": "image processing",
  "jose": "jwt tokens",
  "json2csv": "csv export",
  "mongoose": "database orm",
  "qrcode": "qr code generation",
  "validator": "data validation"
}
```

### DevDependencies
```json
{
  "nodemon": "auto-reload during development"
}
```

---

**Version**: 5.0.0  
**Architecture Type**: MVC (Model-View-Controller) + Services  
**Frontend Framework**: Vanilla JavaScript  
**Backend Framework**: Express.js  
**Database**: MongoDB  
**Status**: ✅ Production Ready
