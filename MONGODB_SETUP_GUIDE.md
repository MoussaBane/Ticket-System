# 🗄️ MongoDB Setup Guide

## ⚠️ Problème Actuel: Authentication Failed

### Issue Identifié
L'erreur `bad auth : authentication failed` indique que:
1. Les credentials MongoDB sont incorrects, OU
2. Le format de la connection string est invalide, OU
3. L'utilisateur MongoDB n'existe pas ou est désactivé

---

## ✅ Solution Recommandée

### Option 1: Utiliser MongoDB Atlas Cloud (Recommandé)

1. **Accédez à MongoDB Atlas**
   - URL: https://www.mongodb.com/cloud/atlas
   - Connectez-vous avec votre compte

2. **Récupérez la Connection String**
   - Allez dans "Clusters"
   - Cliquez sur "Connect"
   - Choisissez "Drivers" → "Node.js"
   - Copiez la connection string

3. **Format attendu:**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

4. **Points importants:**
   - ✅ Remplacez `<username>` par votre utilisateur DB
   - ✅ Remplacez `<password>` par votre mot de passe
   - ✅ Remplacez `<cluster>` par votre cluster ID
   - ✅ Remplacez `<database>` par le nom de la BD
   - ⚠️ Si le mot de passe contient caractères spéciaux, encadrez-le

5. **Mise à jour du `.env`:**
   ```env
   DB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ticket_system?retryWrites=true&w=majority
   ```

---

### Option 2: Utiliser MongoDB Localement (Pour Development)

Si vous préférez MongoDB local:

1. **Téléchargez MongoDB**
   - https://www.mongodb.com/try/download/community

2. **Installation & Démarrage**
   ```bash
   # Windows
   mongod
   ```

3. **Mise à jour du `.env`:**
   ```env
   DB_URI=mongodb://localhost:27017/ticket_system
   ```

---

## 🔍 Checklist de Dépannage

- [ ] L'utilisateur MongoDB existe dans MongoDB Atlas
- [ ] Le mot de passe est correct
- [ ] La connection string inclut le nom de la base de données
- [ ] La connection string inclut `?retryWrites=true&w=majority`
- [ ] L'utilisateur a accès à la base de données
- [ ] L'adresse IP de votre machine est whitelisted dans MongoDB Atlas (si applicable)
- [ ] Aucun caractère spécial non-encodé dans le mot de passe

---

## 🛠️ Étapes pour Corriger

### Étape 1: Vérifier MongoDB Atlas

```
MongoDB Atlas → Clusters → Connect → Connection String
```

Copiez exactement la connection string fournie.

### Étape 2: Mettre à jour `.env`

```env
# Format correct:
DB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/ticket_system?retryWrites=true&w=majority

# Exemple (FICTIF - remplacez par vos vraies valeurs):
DB_URI=mongodb+srv://user123:pass456@cluster0.abc123.mongodb.net/ticket_system?retryWrites=true&w=majority
```

### Étape 3: Tester la Connexion

```bash
npm run dev
```

---

## 📝 Format de `.env` Corrigé

```env
# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Database - Copie directement de MongoDB Atlas
DB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ticket_system?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre_secret_key_de_au_moins_32_caracteres

# Features
ENABLE_SEEDING=true
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASS=AdminPass123
```

---

## 🚀 Test de Démarrage

Une fois les variables correctes:

```bash
npm install
npm run dev
```

Attendez le message:
```
✅ [Database] Connected successfully: cluster0.xxxxx.mongodb.net
✅ [Server] Server running on http://localhost:3000
```

---

## ❌ Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `bad auth : authentication failed` | Credentials incorrects | Vérifiez username/password |
| `ENOTFOUND _mongodb._tcp...` | Cluster ID invalide | Vérifiez le cluster dans Atlas |
| `ECONNREFUSED` | MongoDB local pas démarré | Lancez `mongod` ou utilisez Atlas |
| `MongoError: connect ETIMEDOUT` | Réseau/Firewall | Vérifiez IP whitelist dans Atlas |

---

## 📞 Support

Besoin d'aide? Consultez:
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Mongoose Docs: https://mongoosejs.com
- Troubleshooting: [Voir README.md](README.md)

---

**Prochaine action:** Mettez à jour le `.env` avec vos vraies credentials et relancez `npm run dev`
