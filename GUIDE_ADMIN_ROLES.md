# 👨‍💼 Guide Administrateur - Gestion des Rôles

## 📖 Introduction

Ce guide explique comment gérer les utilisateurs et leurs rôles dans le système de tickets v4.1.

---

## 🎯 Comprendre les Rôles

### Hiérarchie

```
┌─────────────────────────────────────────────┐
│                   ADMIN                      │
│  ✅ Tous les droits                         │
│  ✅ Gérer les utilisateurs                  │
│  ✅ Générer/Supprimer tickets               │
│  ✅ Assigner VIP/NORMAL                     │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│                  MANAGER                     │
│  ✅ Voir tous les tickets                   │
│  ✅ Assigner VIP/NORMAL                     │
│  ✅ Valider présence                        │
│  ❌ Générer/Supprimer tickets               │
│  ❌ Gérer utilisateurs                      │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│                  NORMAL                      │
│  ⏳ Compte en attente                       │
│  ❌ Aucun accès au système                  │
│  📝 Attend validation admin                 │
└─────────────────────────────────────────────┘
```

---

## 🔄 Workflow d'Activation

### Étape 1 : Nouvel Utilisateur S'inscrit

```
1. L'utilisateur accède à /index.html
2. Clique sur "Créer un compte"
3. Remplit le formulaire (nom, email, mot de passe)
4. Le système crée le compte avec le rôle "normal"
```

### Étape 2 : Utilisateur Voit la Page d'Attente

L'utilisateur est automatiquement redirigé vers `/pending.html` :

```
┌────────────────────────────────────────────┐
│  🕒 Compte en Attente de Validation        │
│                                             │
│  📧 Email: user@example.com                │
│  👤 Nom: Jean Dupont                       │
│  ⏳ Statut: En attente                     │
│                                             │
│  📝 Instructions :                         │
│  - Contactez un administrateur             │
│  - L'admin vous attribuera un rôle         │
│  - La page se rafraîchit automatiquement   │
│                                             │
│  [🔄 Rafraîchir] [🚪 Déconnexion]         │
└────────────────────────────────────────────┘
```

### Étape 3 : Admin Valide le Compte

**Vous devez maintenant intervenir !**

#### A. Accéder à la Gestion des Utilisateurs

Option 1 : Via le Panel Admin
```
1. Connectez-vous à http://localhost:3000
2. Cliquez sur "Gérer Utilisateurs" dans le menu Actions
```

Option 2 : Direct
```
Accédez directement à : http://localhost:3000/users.html
```

#### B. Trouver l'Utilisateur en Attente

Dans la liste des utilisateurs, cherchez :
- Badge **NORMAL** (gris) 
- Nom et email de l'utilisateur

#### C. Changer le Rôle

1. Cliquez sur l'icône **⚙️** (Changer Rôle)
2. Une boîte de dialogue s'ouvre
3. Sélectionnez le rôle approprié :
   - **Manager** : Pour la plupart des utilisateurs opérationnels
   - **Admin** : Pour les administrateurs de confiance

4. Cliquez sur "Changer"
5. Confirmation : ✅ "Rôle mis à jour avec succès"

### Étape 4 : Utilisateur Accède au Système

L'utilisateur :
1. Voit le message "Redirection..."
2. Est automatiquement redirigé vers `/admin.html`
3. Peut maintenant accéder au système selon son nouveau rôle

---

## 👀 Identifier les Utilisateurs en Attente

### Méthode 1 : Liste des Utilisateurs

```
Dans /users.html :
- Cherchez les badges NORMAL (couleur grise)
- Ces utilisateurs sont en attente
```

### Méthode 2 : Demande de l'Utilisateur

```
L'utilisateur vous contacte :
- Par email
- Par message
- En personne

Vérifiez son identité avant d'activer !
```

---

## ⚠️ Bonnes Pratiques

### ✅ À FAIRE

1. **Vérifier l'Identité**
   ```
   - Demandez une pièce d'identité
   - Confirmez l'email professionnel
   - Vérifiez la légitimité de la demande
   ```

2. **Attribuer le Bon Rôle**
   ```
   - Manager : Pour 90% des cas
   - Admin : Seulement pour les personnes de confiance
   - Ne laissez pas "normal" indéfiniment
   ```

3. **Informer l'Utilisateur**
   ```
   - Envoyez un email de confirmation
   - Expliquez les fonctionnalités disponibles
   - Donnez les instructions d'utilisation
   ```

4. **Documenter**
   ```
   - Notez qui a validé quel compte
   - Gardez une trace des activations
   - Utile pour l'audit de sécurité
   ```

### ❌ À ÉVITER

1. **Ne PAS Activer Sans Vérification**
   ```
   ❌ Valider un compte sans vérifier l'identité
   ❌ Donner "admin" à tout le monde
   ❌ Laisser des comptes "normal" sans réponse
   ```

2. **Ne PAS Donner Admin par Défaut**
   ```
   ⚠️ Le rôle "admin" permet de :
   - Supprimer tous les tickets
   - Changer les rôles des autres
   - Générer des tickets illimités
   
   → Réservé aux personnes de confiance !
   ```

3. **Ne PAS Ignorer les Demandes**
   ```
   ❌ Laisser un utilisateur bloqué pendant des jours
   ✅ Répondre rapidement (sous 24h idéalement)
   ```

---

## 🔍 Cas Pratiques

### Cas 1 : Nouvel Employé

```
Contexte : Un nouvel employé rejoint l'équipe

Actions :
1. L'employé crée son compte
2. Vous recevez une notification (email/message)
3. Vérifiez son identité (badge, contrat)
4. Attribuez le rôle "manager"
5. Informez-le par email

Durée : ~5 minutes
```

### Cas 2 : Compte Test

```
Contexte : Vous voulez tester le système

Actions :
1. Créez un compte test (testuser@example.com)
2. Ce compte reste en "normal"
3. Testez la page d'attente
4. Changez en "manager" pour tester le panel
5. Supprimez le compte après les tests

Durée : ~10 minutes
```

### Cas 3 : Promotion d'un Manager

```
Contexte : Un manager devient admin

Actions :
1. Accédez à /users.html
2. Trouvez le manager (badge MANAGER en violet)
3. Cliquez sur "Changer Rôle"
4. Sélectionnez "admin"
5. Le badge devient rouge (ADMIN)

Durée : ~2 minutes
```

### Cas 4 : Compte Suspect

```
Contexte : Un compte avec un email louche

Actions :
1. N'activez PAS le compte
2. Contactez l'adresse email pour vérifier
3. Si pas de réponse sous 48h → Supprimez le compte
4. Documentez l'incident

Durée : Variable
```

---

## 📊 Surveillance des Utilisateurs

### Indicateurs à Surveiller

```
1. Nombre de comptes "normal" en attente
   → Si > 10 : Processus de validation trop lent

2. Ratio Admin/Manager
   → Idéal : 1 admin pour 5-10 managers

3. Comptes inactifs
   → Vérifiez les comptes créés il y a >30 jours sans activité
```

### Actions Régulières

**Hebdomadaire** :
- Vérifier les comptes "normal" en attente
- Valider ou supprimer les comptes

**Mensuel** :
- Audit des rôles admin
- Vérifier les comptes inactifs
- Nettoyer les comptes test

**Trimestriel** :
- Révision complète des accès
- Mise à jour de la documentation
- Formation des nouveaux admins

---

## 🆘 Résolution de Problèmes

### Problème 1 : Utilisateur ne Voit Pas le Changement

**Symptôme** : Le rôle est changé mais l'utilisateur voit toujours pending.html

**Solution** :
```
1. Demandez à l'utilisateur de se déconnecter
2. Se reconnecter
3. Le nouveau rôle sera appliqué
```

**Explication** : Le JWT token contient le rôle. Il faut une nouvelle connexion pour obtenir un nouveau token.

### Problème 2 : Impossible de Changer le Rôle

**Symptôme** : Erreur lors du changement de rôle

**Solutions** :
```
A. Vérifiez que vous êtes admin
   - Seuls les admins peuvent changer les rôles

B. Vérifiez la connexion au serveur
   - Rafraîchissez la page
   - Réessayez

C. Consultez la console navigateur (F12)
   - Cherchez les erreurs en rouge
```

### Problème 3 : Utilisateur Toujours en "Normal"

**Symptôme** : Le compte reste "normal" malgré les changements

**Diagnostic** :
```
1. Vérifiez dans users.html :
   - Le badge est-il MANAGER/ADMIN ?

2. Si oui mais l'utilisateur voit pending.html :
   - Token JWT pas mis à jour
   - Solution : Déconnexion/Reconnexion

3. Si le badge est toujours NORMAL :
   - Le changement n'a pas été sauvegardé
   - Réessayez le changement de rôle
```

---

## 📋 Checklist de Validation

Avant d'activer un compte, vérifiez :

- [ ] Identité de l'utilisateur confirmée
- [ ] Email professionnel valide
- [ ] Besoin légitime d'accès au système
- [ ] Rôle approprié sélectionné (Manager > Admin)
- [ ] Utilisateur informé de l'activation
- [ ] Documentation de l'activation (optionnel)

---

## 🔗 Liens Utiles

- **Gestion Utilisateurs** : http://localhost:3000/users.html
- **Panel Admin** : http://localhost:3000/admin.html
- **Documentation Rôles** : `ROLES_V4.1.md`
- **Changelog** : `CHANGELOG.md`

---

## 📞 Support

Pour toute question sur la gestion des rôles :

1. Consultez `ROLES_V4.1.md` pour la documentation complète
2. Vérifiez `CHANGELOG.md` pour les dernières modifications
3. Contactez l'équipe de développement

---

**Version** : 4.1.0  
**Dernière mise à jour** : 13 Décembre 2024  
**Auteur** : Équipe de Développement
