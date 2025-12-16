# 🚀 Guide de Démarrage Rapide - Ticket System v5.0

## ⚡ Installation en 5 Minutes

### 1. Clonage et Installation
```bash
# Cloner le projet
git clone <repository-url>
cd ticket-system

# Installer les dépendances
npm install
```

### 2. Configuration Environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

**Paramètres essentiels** :
```dotenv
PORT=3000
NODE_ENV=development

# MongoDB (choisir l'une des deux options)
DB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ticket_system?retryWrites=true&w=majority

# OU
# DB_USERNAME=your_user
# DB_PASSWORD=your_password

# JWT (générer : node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=<32+ caractères aléatoires>
JWT_EXPIRES_IN=3h
```

### 3. Démarrer le Serveur
```bash
# Mode développement (auto-reload)
npm run dev

# Mode production
npm start
```

**Résultat attendu** :
```
✅ Server running at http://localhost:3000
📊 Health: http://localhost:3000/health
```

### 4. Accéder à l'Application
```
Browser: http://localhost:3000
```

---

## 📝 Credentials de Démo

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@example.com | AdminPass123 |
| Manager | manager@example.com | ManagerPass123 |

---

## 📁 Structure du Projet

```
project/
├── backend/
│   ├── src/
│   │   ├── config/      ← Configuration
│   │   ├── routes/      ← API routes
│   │   ├── controllers/ ← HTTP handlers
│   │   ├── services/    ← Logique métier
│   │   ├── models/      ← Schémas DB
│   │   ├── middlewares/ ← Auth, erreurs
│   │   ├── utils/       ← Utilitaires
│   │   └── app.js       ← Configuration Express
│   └── server.js        ← Point d'entrée
│
├── frontend/
│   ├── pages/           ← Pages HTML
│   ├── js/              ← JavaScript
│   │   ├── api-client.js        ← Client HTTP
│   │   ├── services/            ← Services
│   │   └── utils/               ← Utilitaires
│   ├── css/             ← Stylesheets
│   └── assets/          ← Images
│
├── package.json         ← Dépendances
├── .env                 ← Configuration (ne pas committer!)
├── .env.example         ← Template
└── README.md            ← Documentation
```

---

## 🎯 Fonctionnalités Principales

### Pour les Administrateurs
- 👥 Gestion complète des utilisateurs
- 🎫 Génération de tickets (jusqu'à 1000)
- ✅ Validation des tickets
- 📊 Statistiques et rapports
- 🔑 Gestion des rôles

### Pour les Managers
- 📋 Gestion des réservations
- 🎟️ Attribution de tickets
- ✅ Validation d'accès
- 📤 Import/Export données

---

## 💻 Commandes Principales

```bash
# Installation
npm install

# Démarrage
npm start              # Production
npm run dev           # Développement
npm run backend       # Backend uniquement
npm run backend:dev   # Backend avec reload

# Health check
curl http://localhost:3000/health
```

---

## 🔌 Points Terminaison API (Exemples)

### Authentification
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123"}'

# Résultat
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": { "email": "admin@example.com", "role": "admin" }
  }
}
```

### Tickets
```bash
# Générer 100 tickets
curl -X POST http://localhost:3000/api/tickets/generate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"count":100,"ticketType":"NORMAL"}'

# Statistiques
curl http://localhost:3000/api/tickets/stats \
  -H "Authorization: Bearer <TOKEN>"

# Valider ticket
curl -X POST http://localhost:3000/api/tickets/validate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

### Utilisateurs (Admin only)
```bash
# Lister les utilisateurs
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>"

# Créer un utilisateur
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Dupont",
    "prenom":"Jean",
    "email":"jean@example.com",
    "password":"SecurePass123",
    "role":"manager"
  }'
```

---

## 🔐 Authentification

### How Auth Works
1. User logs in avec email/password
2. Backend valide et retourne JWT token
3. Token stocké en localStorage
4. Chaque requête API inclut le token dans l'header
5. Backend vérifie le token pour chaque requête

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Default: 3 heures
- Configurable dans `.env` (JWT_EXPIRES_IN)
- Expiration complète → redirection vers login

---

## 📊 Architecture API

### Request Format
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

### Response Format (Success)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ },
  "statusCode": 200
}
```

### Response Format (Error)
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["detail1", "detail2"],
  "statusCode": 400
}
```

---

## 🛠️ Troubleshooting

### Problème : "Cannot find module"
```bash
# Solution
npm install
```

### Problème : "MongoDB connection failed"
```
Vérifier:
✓ MongoDB URI dans .env
✓ Credentials corrects
✓ Whitelist IP (si Atlas)
✓ MongoDB est lancé
```

### Problème : "JWT_SECRET not configured"
```bash
# Solution
# 1. Générer une clé
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Ajouter dans .env
JWT_SECRET=<votre_clé_générée>

# 3. Relancer le serveur
npm run dev
```

### Problème : Port 3000 déjà utilisé
```bash
# Solution 1: Changer le port dans .env
PORT=3001

# Solution 2: Tuer le processus
lsof -i :3000
kill -9 <PID>
```

### Problème : CORS Error
```
✓ Vérifier que le backend est lancé
✓ Vérifier les headers CORS
✓ Vérifier l'URL du frontend
```

---

## 📚 Documentation Détaillée

- **[README_REFACTORED.md](README_REFACTORED.md)** - Documentation complète
- **[REFACTORING_PLAN.md](REFACTORING_PLAN.md)** - Plan technique
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - Résumé des changements

---

## 🚀 Déploiement

### Heroku / Railway / Render
```bash
# 1. Créer compte et app
# 2. Configurer variables d'environnement
# 3. Pousser code
git push heroku main

# 4. Ouvrir l'app
heroku open
```

### Variables Environnement Requises
```
NODE_ENV=production
PORT=<provided by platform>
DB_URI=<production mongodb>
JWT_SECRET=<secure random string>
```

---

## 💡 Tips & Bonnes Pratiques

### Sécurité
- ✅ Toujours utiliser HTTPS en production
- ✅ Garder JWT_SECRET secret
- ✅ Valider les inputs côté serveur
- ✅ Ne jamais committer .env
- ✅ Utiliser des secrets managers (AWS Secrets, Azure KeyVault)

### Performance
- ✅ Utiliser indexes MongoDB
- ✅ Batch processing pour bulk operations
- ✅ Caching approprié
- ✅ Rate limiting activé
- ✅ Compression GZIP

### Monitoring
- ✅ Logs centralisés
- ✅ Health checks réguliers
- ✅ Alertes sur erreurs
- ✅ Performance metrics

---

## 📞 Support

Pour des problèmes :
1. Consulter la documentation
2. Vérifier les logs du serveur
3. Tester l'API avec curl/Postman
4. Vérifier la connexion à MongoDB

---

## 🎓 Architecture Décisions

| Aspect | Choix | Raison |
|--------|-------|--------|
| **Framework** | Express | Légèrement, flexible, maturité |
| **Database** | MongoDB | Flexible schema, JSON native |
| **Auth** | JWT | Stateless, scalable |
| **Frontend** | Vanilla JS | Zéro dépendances externes |
| **Styling** | Bootstrap + CSS | Responsive, rapide |

---

**✅ Prêt à démarrer!**

Pour tout problème supplémentaire, consultez la documentation complète dans les fichiers README.

---

**Version** : 5.0.0  
**Dernière mise à jour** : Décembre 2025
