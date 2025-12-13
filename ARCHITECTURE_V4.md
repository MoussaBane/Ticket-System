# Nouvelle Architecture du Système de Tickets

## Vue d'ensemble

Le système a été restructuré pour simplifier la gestion des tickets avec un panel administratif unifié et l'introduction de deux types de tickets : **VIP** et **NORMAL**.

## Changements Principaux

### 1. Panel Administratif Unifié

- **Ancienne Architecture** : Séparation entre le panel admin et le panel manager
- **Nouvelle Architecture** : Un seul panel admin avec contrôle d'accès basé sur les rôles

Tous les utilisateurs (admin, manager, normal) accèdent au même panel : `http://localhost:3000/admin.html`

### 2. Types de Tickets

Le système gère maintenant deux types de tickets avec des limites fixes :

| Type | Limite | Description |
|------|--------|-------------|
| **VIP** | 90 tickets | Tickets premium pour invités spéciaux |
| **NORMAL** | 410 tickets | Tickets standard |
| **TOTAL** | 500 tickets | Capacité maximale de l'événement |

### 3. Assignation Automatique

#### Ancienne Méthode
```javascript
// L'utilisateur devait saisir le nom de la personne
assignTicket(ticketId) {
  const name = prompt("Nom de la personne:");
  // ...
}
```

#### Nouvelle Méthode
```javascript
// Le ticket est automatiquement assigné à l'utilisateur connecté
assignTickets(type) {
  // type = 'VIP' ou 'NORMAL'
  // Le nom est automatiquement pris depuis le token JWT
  // L'utilisateur choisit uniquement le type et le nombre
}
```

## Modèle de Données

### Nouveau Schéma Ticket

```javascript
{
  code: String,              // Code unique du ticket
  ticketType: String,        // 'VIP' ou 'NORMAL' (défaut: 'NORMAL')
  isAssigned: Boolean,       // Statut d'assignation
  assignedTo: String,        // Nom de la personne assignée
  assignedBy: ObjectId,      // Référence vers l'utilisateur qui a assigné (NEW)
  assignedAt: Date,          // Date d'assignation
  isUsed: Boolean,           // Statut de validation
  usedAt: Date,              // Date de validation
  // ... autres champs
}
```

## Nouvelles Routes API

### 1. Statistiques avec Types de Tickets

**GET** `/admin/tickets/stats/summary`

**Autorisation**: Admin ou Manager

**Réponse**:
```json
{
  "success": true,
  "data": {
    "total": 500,
    "assigned": 350,
    "available": 150,
    "used": 200,
    "vip": {
      "total": 75,
      "limit": 90,
      "remaining": 15,
      "used": 50
    },
    "normal": {
      "total": 275,
      "limit": 410,
      "remaining": 135,
      "used": 150
    }
  }
}
```

### 2. Assignation en Masse

**POST** `/admin/tickets/assign-bulk`

**Autorisation**: Admin ou Manager

**Corps de la Requête**:
```json
{
  "count": 5,
  "ticketType": "VIP"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "assigned": 5,
    "ticketType": "VIP",
    "assignedTo": "Jean Dupont"
  },
  "message": "5 tickets VIP assigned successfully"
}
```

### 3. Assignation Individuelle (Modifiée)

**PUT** `/admin/tickets/:id/assign`

**Autorisation**: Admin ou Manager

**Corps de la Requête**:
```json
{
  "ticketType": "NORMAL"
}
```

**Comportement**:
- Le ticket est assigné à l'utilisateur connecté (extrait du token JWT)
- Le champ `assignedBy` est automatiquement rempli avec l'ID de l'utilisateur
- Vérifie les limites VIP/NORMAL avant d'assigner

## Interface Utilisateur

### Nouvelles Fonctionnalités

1. **Cartes Statistiques**
   - Total des tickets
   - Tickets VIP (avec barre de progression)
   - Tickets NORMAL (avec barre de progression)
   - Présents

2. **Section d'Assignation**
   - Deux cartes côte à côte : VIP et NORMAL
   - Champ de saisie pour le nombre de tickets
   - Affichage des tickets restants
   - Boutons stylisés différemment pour VIP (or) et NORMAL (bleu)

3. **Filtres Améliorés**
   - Filtre par type (VIP/NORMAL)
   - Filtre par statut (assigné/non assigné/présent)
   - Recherche textuelle

4. **Tableau des Tickets**
   - Colonne "Type" avec badges stylisés
   - Colonne "Assigné par" montrant qui a fait l'assignation
   - Actions contextuelles selon le statut

### Contrôle d'Accès par Rôle

#### Admin
- ✅ Voir tous les tickets
- ✅ Assigner des tickets VIP et NORMAL
- ✅ Générer de nouveaux tickets
- ✅ Supprimer des tickets
- ✅ Gérer les utilisateurs
- ✅ Exporter en CSV

#### Manager
- ✅ Voir tous les tickets
- ✅ Assigner des tickets VIP et NORMAL
- ❌ Générer de nouveaux tickets
- ❌ Supprimer des tickets
- ❌ Gérer les utilisateurs
- ✅ Exporter en CSV

#### Normal
- ✅ Voir tous les tickets
- ✅ Assigner des tickets VIP et NORMAL
- ❌ Générer de nouveaux tickets
- ❌ Supprimer des tickets
- ❌ Gérer les utilisateurs
- ✅ Exporter en CSV

> **Note**: Les contrôles d'administration sont cachés pour les non-admins dans l'interface.

## Workflow d'Utilisation

### Pour un Manager

1. **Connexion**
   ```
   Se connecter à /admin-auth.html avec les identifiants manager
   ```

2. **Assigner des Tickets VIP**
   ```
   - Aller dans la section "Assigner Tickets VIP"
   - Entrer le nombre de tickets VIP souhaités (ex: 3)
   - Cliquer sur "Assigner VIP"
   - Les tickets sont automatiquement assignés au manager connecté
   ```

3. **Assigner des Tickets NORMAL**
   ```
   - Aller dans la section "Assigner Tickets Normal"
   - Entrer le nombre de tickets souhaités (ex: 10)
   - Cliquer sur "Assigner Normal"
   ```

4. **Visualiser ses Assignations**
   ```
   - Le tableau affiche tous les tickets
   - Filtrer par "Assigné par" pour voir ses propres assignations
   - La colonne "Assigné à" montre le nom du manager
   - La colonne "Assigné par" confirme l'auteur de l'assignation
   ```

### Pour un Admin

En plus des fonctionnalités manager :

1. **Générer des Tickets**
   ```
   - Cliquer sur "Actions" > "Générer Tickets"
   - Entrer le nombre de tickets à créer
   - Les tickets sont créés sans type par défaut (NORMAL)
   ```

2. **Gérer les Utilisateurs**
   ```
   - Cliquer sur "Actions" > "Utilisateurs"
   - Créer/Modifier/Supprimer des utilisateurs
   - Changer les rôles des utilisateurs
   ```

## Export CSV

Le fichier CSV exporté contient maintenant :

```csv
_id,code,ticketType,isAssigned,assignedTo,assignedBy,assignedAt,isUsed,usedAt,createdAt
64a1...,123456,VIP,true,Jean Dupont,Marie Martin,2024-12-13T10:30:00Z,false,,2024-12-13T09:00:00Z
64a2...,789012,NORMAL,true,Pierre Doe,Jean Dupont,2024-12-13T11:00:00Z,true,2024-12-13T19:00:00Z,2024-12-13T09:00:00Z
```

## Validations et Contraintes

### Limites de Tickets

```javascript
// Le système vérifie automatiquement les limites
if (ticketType === 'VIP' && (vipCount + count) > 90) {
  return error("Limite VIP dépassée");
}

if (ticketType === 'NORMAL' && (normalCount + count) > 410) {
  return error("Limite NORMAL dépassée");
}
```

### Assignation en Masse

- Minimum : 1 ticket
- Maximum : 100 tickets par requête
- Vérifie la disponibilité des tickets non assignés

## Migration depuis l'Ancien Système

### Tickets Existants

Les tickets créés avant la mise à jour :
- Auront `ticketType = 'NORMAL'` par défaut
- `assignedBy` sera `null` pour les anciens tickets
- Tous les autres champs restent inchangés

### Compatibilité

✅ Le système est rétrocompatible avec les anciens tickets
✅ Les anciennes routes continuent de fonctionner
✅ Les données existantes ne sont pas perdues

## Dépannage

### Problème : "Limite VIP dépassée"

**Cause**: Plus de 90 tickets VIP ont déjà été assignés

**Solution**: Assigner des tickets NORMAL ou attendre qu'un admin augmente la limite

### Problème : "Only X unassigned tickets available"

**Cause**: Pas assez de tickets non assignés disponibles

**Solution**: Un admin doit générer plus de tickets via "Générer Tickets"

### Problème : "Token missing or invalid"

**Cause**: Session expirée ou token JWT invalide

**Solution**: Se reconnecter via /admin-auth.html

## Sécurité

### Authentification

- Tous les endpoints nécessitent un token JWT valide
- Les tokens expirent après 3 heures (configurable via `JWT_EXPIRES_IN`)

### Autorisation

- Vérification du rôle à chaque requête
- Les actions administratives sont protégées par `roleAuth("admin")`
- L'assignation est accessible via `roleAuth("admin", "manager")`

### Audit Trail

- Chaque assignation enregistre l'utilisateur qui l'a faite (`assignedBy`)
- Les dates d'assignation et d'utilisation sont conservées
- Export CSV pour analyse ultérieure

## Configuration Recommandée

### .env

```env
# Limites de tickets (optionnel, valeurs par défaut dans le code)
VIP_LIMIT=90
NORMAL_LIMIT=410

# JWT Configuration
JWT_SECRET=votre_secret_tres_securise_ici
JWT_EXPIRES_IN=3h

# MongoDB
DB_URI=mongodb+srv://...

# Email (pour envoi de tickets)
MAIL_USER=votre_email@example.com
MAIL_PASS=votre_mot_de_passe_app
```

## Améliorations Futures Possibles

1. ✨ Historique détaillé des assignations
2. ✨ Statistiques par utilisateur
3. ✨ Notifications en temps réel
4. ✨ Limites configurables via interface admin
5. ✨ Import/Export de configurations
6. ✨ Tableau de bord avec graphiques
7. ✨ API pour applications mobiles

---

**Version**: 4.0.0  
**Date**: Décembre 2024  
**Auteur**: Moussa BANE
