# 🎯 Verification Checklist - MongoDB Setup

## ✅ Pre-Flight Checklist

### 1. MongoDB Atlas Account
- [ ] Compte créé sur https://www.mongodb.com/cloud/atlas
- [ ] Logged in
- [ ] Cluster créé

### 2. Database User
- [ ] Utilisateur créé pour la base de données
- [ ] Password généré et copié de manière sécurisée
- [ ] Rôle: `readWriteAnyDatabase@admin` (ou plus restrictif)
- [ ] Status: Actif (pas désactivé)

### 3. Network Access
- [ ] IP whitelist configurée:
  - [ ] Pour development: `0.0.0.0/0` (Accept from Anywhere)
  - [ ] Pour production: Votre IP serveur spécifique

### 4. Connection String
- [ ] Récupérée de MongoDB Atlas (Clusters → Connect)
- [ ] Format vérifié: `mongodb+srv://user:pass@cluster.mongodb.net/db`
- [ ] Database name inclus (ex: `/ticket_system`)
- [ ] Query parameters corrects: `?retryWrites=true&w=majority`

---

## 🔍 Verification Steps

### Step 1: MongoDB Atlas Connection String

**Où la récupérer:**
```
1. Accédez: https://cloud.mongodb.com
2. Sélectionnez votre projet
3. Cliquez: Clusters → Connect
4. Choisissez: Drivers → Node.js
5. Copiez la connection string
```

**Vérifiez que la string contient:**
```
✅ mongodb+srv://         (protocole)
✅ username:password@      (credentials)
✅ cluster0.xxxxx.mongodb.net  (cluster address)
✅ /ticket_system          (database name)
✅ ?retryWrites=true&w=majority  (options)
```

### Step 2: Update `.env` File

**File location:** `c:\Users\banem\Downloads\Github Repositories\Ticket System\.env`

**Exact format required:**
```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# MongoDB Connection String (copy from Atlas)
DB_URI=mongodb+srv://banemoussa2001_db_user:GFvwvmEUkZrfXIQJ@cluster0.7ahxylq.mongodb.net/ticket_system?retryWrites=true&w=majority

# JWT Secret (keep secure, min 32 chars)
JWT_SECRET=MOUSSA-BANE-Ticket-SYSTEM-PROJECT-CLEAN-UP-2025-SecureKeyFor2025

# Features
ENABLE_SEEDING=true
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASS=AdminPass123
SEED_MANAGER_EMAIL=manager@example.com
SEED_MANAGER_PASS=ManagerPass123
```

### Step 3: Test Connection

**Run the dev server:**
```bash
npm run dev
```

**Expected output (success):**
```
[2025-12-16T14:XX:XX.XXX+00:00] [INFO] [Server] Starting application...
[Database] Connecting to MongoDB...
[Database] Connected successfully: cluster0.7ahxylq.mongodb.net
✅ [Server] Server running on http://localhost:3000
```

**Error output (failure):**
```
[Database] Connection failed: bad auth : authentication failed
❌ [Server] Failed to start server
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "bad auth : authentication failed"

**Possible causes:**
1. Wrong username or password
2. Special characters in password not URL-encoded
3. User doesn't have database access
4. User is disabled in MongoDB Atlas

**Fix:**
```
1. Go to MongoDB Atlas → Database Access
2. Reset password or create new user
3. Copy new credentials to .env
4. Ensure user has access to database
5. Restart with: npm run dev
```

### Issue 2: "ENOTFOUND _mongodb._tcp.cluster..."

**Cause:** Invalid cluster address in connection string

**Fix:**
```
1. Double-check cluster ID from MongoDB Atlas
2. Verify database name is in the URL
3. Use exact connection string from Atlas
4. Restart with: npm run dev
```

### Issue 3: "connect ETIMEDOUT"

**Cause:** Network connectivity issue or IP whitelist

**Fix:**
```
1. Go to MongoDB Atlas → Network Access
2. Add your IP: Click "Add IP Address"
3. Select: "Allow Access from Anywhere" (0.0.0.0/0)
4. Or specify your exact IP address
5. Wait 1-2 minutes for changes to apply
6. Restart with: npm run dev
```

### Issue 4: "authentication failed" but credentials are correct

**Cause:** User might be disabled or database access removed

**Fix:**
```
1. Go to MongoDB Atlas → Database Access
2. Click the user → Edit
3. Verify "Database User Privileges"
4. Ensure role is: readWriteAnyDatabase@admin
5. Or specifically: readWrite on ticket_system
6. Save changes and restart
```

---

## 📋 Required Information from MongoDB Atlas

Before starting, gather:

```
Connection String:  mongodb+srv://user:pass@cluster.mongodb.net/db
Username:          banemoussa2001_db_user (or your username)
Password:          GFvwvmEUkZrfXIQJ (or your password)
Cluster ID:        cluster0.7ahxylq (or your cluster)
Database Name:     ticket_system (required in URL)
```

---

## 🔐 Security Best Practices

### For Development:
```env
DB_URI=mongodb+srv://dev_user:dev_password@cluster.mongodb.net/ticket_system
JWT_SECRET=dev-secret-key-change-this-in-production
```

### For Production:
```env
DB_URI=mongodb+srv://prod_user:prod_password@cluster.mongodb.net/ticket_system
JWT_SECRET=very-long-secure-key-at-least-32-characters
NODE_ENV=production
```

**Important:**
- [ ] Never commit `.env` file to GitHub
- [ ] Use different credentials for dev and production
- [ ] Rotate passwords regularly
- [ ] Whitelist specific IPs in production
- [ ] Keep JWT_SECRET secure and long (32+ characters)

---

## ✨ Ready to Start?

Once all checks pass:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# You should see:
# ✅ [Database] Connected successfully
# ✅ [Server] Server running on http://localhost:3000
```

---

## 📞 Need Help?

1. Check `MONGODB_SETUP_GUIDE.md` for detailed setup
2. Check `TROUBLESHOOTING_MONGODB.md` for error solutions
3. Review `QUICKSTART.md` for overall setup
4. Visit: https://docs.mongodb.com/manual/

---

**Status:** Ready for setup  
**Last Updated:** December 16, 2025
