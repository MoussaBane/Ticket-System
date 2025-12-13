# 🔐 Guide Rapide - Rôle "Normal" v4.1

## 🎯 En Résumé

Les utilisateurs avec le rôle "normal" **ne peuvent rien faire** jusqu'à ce qu'un admin leur attribue un rôle actif (Manager ou Admin).

---

## 🔄 Workflow Simple

```
1. Utilisateur s'inscrit
   ↓
2. Rôle "normal" automatique
   ↓
3. Redirection vers page d'attente
   ↓
4. Utilisateur contacte admin
   ↓
5. Admin change le rôle
   ↓
6. Page se rafraîchit automatiquement
   ↓
7. ✅ Accès au système
```

---

## 👁️ Ce que Voit l'Utilisateur "Normal"

```
┌──────────────────────────────────────────┐
│  🕒 Compte en Attente de Validation      │
│                                           │
│  📧 Email: user@example.com              │
│  👤 Nom: Jean Dupont                     │
│  ⏳ Statut: En attente                   │
│                                           │
│  📝 Que faire ?                          │
│  1. Contactez un administrateur          │
│  2. Attendez la validation               │
│  3. La page se rafraîchit toute seule    │
│                                           │
│  [🔄 Rafraîchir] [🚪 Déconnexion]       │
└──────────────────────────────────────────┘
```

---

## 👨‍💼 Comment Activer un Compte (Admin)

1. **Aller sur** : http://localhost:3000/users.html
2. **Trouver** : L'utilisateur avec badge NORMAL (gris)
3. **Cliquer** : ⚙️ "Changer Rôle"
4. **Sélectionner** : Manager (ou Admin si nécessaire)
5. **Confirmer** : Cliquer sur "Changer"
6. **Résultat** : Badge devient MANAGER (violet)

**Durée** : ~30 secondes

---

## 🔒 Sécurité

### 3 Niveaux de Protection

1. **Frontend** : Redirection automatique vers pending.html
2. **Backend** : Routes bloquées pour "normal" 
3. **Token** : Rôle signé, impossible à falsifier

**Résultat** : Même en essayant de tricher, "normal" ne peut rien faire !

---

## 📊 Hiérarchie des Rôles

```
🔴 ADMIN
   ✅ Tout faire
   ✅ Gérer utilisateurs
   ✅ Générer/Supprimer tickets

🟣 MANAGER
   ✅ Assigner VIP/NORMAL
   ✅ Voir tickets
   ❌ Gérer utilisateurs

⚪ NORMAL
   ❌ Aucun accès
   ⏳ Attend validation
```

---

## ✅ Checklist Rapide

Pour l'Admin :
- [ ] Vérifier l'identité de l'utilisateur
- [ ] Changer le rôle (normal → manager)
- [ ] Informer l'utilisateur (optionnel)

Pour l'Utilisateur :
- [ ] S'inscrire sur le site
- [ ] Attendre sur pending.html
- [ ] Contacter un admin
- [ ] Rafraîchir la page après validation

---

## 📖 Documentation Complète

- **Technique** : `ROLES_V4.1.md`
- **Guide Admin** : `GUIDE_ADMIN_ROLES.md`
- **Implémentation** : `IMPLEMENTATION_V4.1_COMPLETE.md`
- **Changelog** : `CHANGELOG.md`

---

## 🆘 Aide Rapide

**Q : Un utilisateur "normal" peut-il faire quelque chose ?**  
R : Non, absolument rien. Seulement voir pending.html.

**Q : Comment devenir Manager ou Admin ?**  
R : Seul un Admin peut changer le rôle via /users.html.

**Q : Combien de temps pour l'activation ?**  
R : Dépend de l'admin. Auto-refresh détecte le changement sous 30s.

---

**Version** : 4.1.0 | **Date** : 13 Déc 2024 | **Statut** : ✅ Prêt
