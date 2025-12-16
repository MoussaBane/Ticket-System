# 🚀 Quick MongoDB Test - Local Solution

## ⚡ Option 1: MongoDB Local (Express Test)

Si vous ne pouvez pas accéder à MongoDB Atlas pour le moment, testez localement:

### Installation MongoDB Local (Windows)

**Option A: Installer MongoDB Community Edition**
```bash
# 1. Téléchargez depuis: https://www.mongodb.com/try/download/community
# 2. Installez avec les options par défaut
# 3. MongoDB démarre automatiquement en tant que service Windows
```

**Option B: Utiliser MongoDB avec Docker**
```bash
# 1. Installez Docker
# 2. Lancez MongoDB dans Docker:
docker run -d -p 27017:27017 --name mongodb mongo

# 3. Pour arrêter:
docker stop mongodb
```

### Configuration Pour MongoDB Local

**Mettez à jour `.env`:**

```env
# Changez cette ligne:
# DB_URI=mongodb+srv://...

# En ceci (pour local):
DB_URI=mongodb://localhost:27017/ticket_system

# Gardez le reste pareil:
PORT=3000
NODE_ENV=development
JWT_SECRET=MOUSSA-BANE-Ticket-SYSTEM-PROJECT-CLEAN-UP-2025-SecureKeyFor2025
```

### Testez la Connexion

```bash
npm run dev
```

**Si réussi, vous verrez:**
```
✅ [Database] Connected successfully: 127.0.0.1
✅ [Server] Server running on http://localhost:3000
```

---

## ⚡ Option 2: Test Avec MongoDB Atlas - Débogage

Si vous utilisez MongoDB Atlas mais recevez "bad auth: authentication failed":

### Debug: Vérifier les Credentials

**Fichier test:** `test-mongo-connection.js`

Créez ce fichier à la racine du projet:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('📝 MongoDB URI:', process.env.DB_URI || 'NOT SET');
    
    const conn = await mongoose.connect(
      process.env.DB_URI || 'mongodb://localhost:27017/ticket_system'
    );
    
    console.log('✅ Connection successful!');
    console.log('🔗 Connected to:', conn.connection.host);
    console.log('📊 Database:', conn.connection.db.databaseName);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
```

**Exécutez le test:**
```bash
node test-mongo-connection.js
```

---

## 📋 Checklist MongoDB Atlas Fix

Si vous avez une erreur d'authentification:

- [ ] **Step 1:** Accédez à https://cloud.mongodb.com
- [ ] **Step 2:** Allez à "Database Access"
- [ ] **Step 3:** Vérifiez que l'utilisateur existe:
  - [ ] Username: `banemoussa2001_db_user` (ou votre username)
  - [ ] Status: Active (pas "Disabled")
  
- [ ] **Step 4:** Si absent ou désactivé, créez un nouvel utilisateur:
  - [ ] Click "Add New Database User"
  - [ ] Generate password
  - [ ] Copy the password
  - [ ] Click "Add User"

- [ ] **Step 5:** Récupérez la connection string:
  - [ ] Click "Clusters" → "Connect"
  - [ ] Click "Drivers" → "Node.js"
  - [ ] Copy the full connection string
  - [ ] Replace username and password dans la string

- [ ] **Step 6:** Mettez à jour `.env`:
  ```env
  DB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/ticket_system?retryWrites=true&w=majority
  ```

- [ ] **Step 7:** Vérifiez Network Access:
  - [ ] Click "Network Access"
  - [ ] Ensure `0.0.0.0/0` is whitelisted (or your IP)

- [ ] **Step 8:** Testez:
  ```bash
  npm run dev
  ```

---

## 🆘 Still Getting "bad auth"?

### Nuclear Option: Reset Everything

```bash
# 1. Arrêtez le serveur (Ctrl+C)

# 2. Supprimez le fichier .env local:
del .env

# 3. Copiez le template:
copy .env.example .env

# 4. Mettez à jour SEULEMENT la DB_URI
# (Laissez les autres vars par défaut)

# 5. Relancez:
npm run dev
```

---

## 📞 Need Support?

### Check These Files:
1. `MONGODB_SETUP_GUIDE.md` - Setup complet
2. `TROUBLESHOOTING_MONGODB.md` - Problèmes courants
3. `MONGODB_VERIFICATION.md` - Checklist
4. `README.md` - Documentation générale

### External Resources:
- MongoDB Docs: https://docs.mongodb.com
- Mongoose Docs: https://mongoosejs.com
- MongoDB Atlas Help: https://www.mongodb.com/docs/atlas

---

## ✅ Expected Success Output

```
$ npm run dev

> ticket-system@5.0.0 dev
> nodemon backend/server.js

[nodemon] 3.1.9
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node backend/server.js`
[2025-12-16T14:XX:XX.XXX+00:00] [INFO] [Server] Starting application...
[Database] Connecting to MongoDB...
[Database] Connected successfully: cluster0.7ahxylq.mongodb.net
✅ [Server] Server running on http://localhost:3000
```

---

**Next:** Follow one of the options above based on your situation!
