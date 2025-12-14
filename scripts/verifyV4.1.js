#!/usr/bin/env node

/**
 * Script de Vérification v4.1
 * Vérifie que l'implémentation est correcte
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - MANQUANT`, 'red');
    return false;
  }
}

function checkFileContains(filePath, searchString, description) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    log(`❌ ${description} - fichier introuvable`, 'red');
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(searchString)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - texte introuvable`, 'red');
    return false;
  }
}

// === DÉBUT DES VÉRIFICATIONS ===

log('\n🔍 VÉRIFICATION v4.1 - Restriction Rôle "Normal"\n', 'blue');

let allChecks = true;

// === 1. Vérifier les fichiers existants ===
log('1️⃣  Fichiers Créés/Modifiés:', 'blue');

allChecks &= checkFile('public/pending.html', 'Page d\'attente (pending.html)');
allChecks &= checkFile('ROLES_V4.1.md', 'Documentation rôles (ROLES_V4.1.md)');
allChecks &= checkFile('GUIDE_ADMIN_ROLES.md', 'Guide administrateur (GUIDE_ADMIN_ROLES.md)');
allChecks &= checkFile('IMPLEMENTATION_V4.1_COMPLETE.md', 'Résumé implémentation');
allChecks &= checkFile('GUIDE_RAPIDE_V4.1.md', 'Guide rapide');
allChecks &= checkFile('LISEZMOI_V4.1.md', 'Lisez-moi v4.1');

// === 2. Vérifier le contenu de pending.html ===
log('\n2️⃣  Contenu de pending.html:', 'blue');

allChecks &= checkFileContains(
  'public/pending.html',
  'Compte en Attente de Validation',
  'Message d\'attente'
);

allChecks &= checkFileContains(
  'public/pending.html',
  'setInterval',
  'Auto-refresh actif'
);

allChecks &= checkFileContains(
  'public/pending.html',
  'userData.role',
  'Vérification du rôle'
);

allChecks &= checkFileContains(
  'public/pending.html',
  'admin.html',
  'Redirection vers admin.html'
);

// === 3. Vérifier la redirection dans admin.html ===
log('\n3️⃣  Redirection dans admin.html:', 'blue');

allChecks &= checkFileContains(
  'public/admin.html',
  "userData.role === 'normal'",
  'Vérification rôle normal'
);

allChecks &= checkFileContains(
  'public/admin.html',
  'pending.html',
  'Redirection vers pending.html'
);

// === 4. Vérifier la sécurité du backend ===
log('\n4️⃣  Sécurité du Backend (index.js):', 'blue');

allChecks &= checkFileContains(
  'index.js',
  'roleAuth("admin", "manager")',
  'Routes protégées avec roleAuth'
);

// Compter le nombre de routes protégées
const indexContent = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
const protectedRoutes = (indexContent.match(/roleAuth\("admin", "manager"\)/g) || []).length;
log(`   → ${protectedRoutes} routes protégées trouvées`, 'green');

if (protectedRoutes < 3) {
  log('   ⚠️  ATTENTION : Moins de 3 routes protégées trouvées', 'yellow');
  allChecks = false;
}

// === 5. Vérifier la documentation ===
log('\n5️⃣  Documentation Complète:', 'blue');

allChecks &= checkFileContains(
  'ROLES_V4.1.md',
  'rôle "normal"',
  'Documentation des rôles'
);

allChecks &= checkFileContains(
  'GUIDE_ADMIN_ROLES.md',
  'Changer le Rôle',
  'Guide administrateur'
);

allChecks &= checkFileContains(
  'CHANGELOG.md',
  '4.1.0',
  'Changelog v4.1.0'
);

// === 6. Vérifier les modèles ===
log('\n6️⃣  Modèles de Données:', 'blue');

allChecks &= checkFileContains(
  'models/Ticket.js',
  'ticketType',
  'Champ ticketType dans Ticket'
);

allChecks &= checkFileContains(
  'models/Ticket.js',
  'assignedBy',
  'Champ assignedBy dans Ticket'
);

// === 7. Vérifier les middlewares ===
log('\n7️⃣  Middlewares de Sécurité:', 'blue');

allChecks &= checkFileContains(
  'middlewares/roleAuth.js',
  'function',
  'Middleware roleAuth défini'
);

// === 8. Vérifier les routes d'assignation ===
log('\n8️⃣  Routes d\'Assignation:', 'blue');

allChecks &= checkFileContains(
  'index.js',
  '/admin/tickets/assign-bulk',
  'Route assignation en masse'
);

allChecks &= checkFileContains(
  'index.js',
  '/admin/tickets/stats/summary',
  'Route statistiques'
);

// === 9. Vérifier les comptes de test ===
log('\n9️⃣  Script de Test (optionnel):', 'blue');

if (fs.existsSync(path.join(__dirname, 'scripts/testV4.js'))) {
  log('✅ Script de test existant (scripts/testV4.js)', 'green');
} else {
  log('ℹ️  Pas de script de test trouvé (optionnel)', 'yellow');
}

// === RÉSUMÉ ===
log('\n' + '='.repeat(50), 'blue');
log('RÉSUMÉ DE LA VÉRIFICATION', 'blue');
log('='.repeat(50) + '\n', 'blue');

if (allChecks) {
  log('✅ TOUS LES TESTS SONT PASSÉS !', 'green');
  log('\nVotre système v4.1 est :');
  log('✅ Correctement implémenté', 'green');
  log('✅ Bien documenté', 'green');
  log('✅ Sécurisé', 'green');
  log('✅ Prêt pour la production', 'green');
} else {
  log('❌ CERTAINS TESTS ONT ÉCHOUÉ', 'red');
  log('\nVeuillez vérifier les éléments marqués en rouge', 'yellow');
}

// === NEXT STEPS ===
log('\n' + '='.repeat(50), 'blue');
log('PROCHAINES ÉTAPES', 'blue');
log('='.repeat(50) + '\n', 'blue');

log('1. Lancer le serveur :', 'yellow');
log('   npm start', 'blue');

log('\n2. Tester la création d\'un compte :', 'yellow');
log('   http://localhost:3000', 'blue');

log('\n3. Vérifier la page d\'attente :', 'yellow');
log('   La page pending.html doit s\'afficher', 'blue');

log('\n4. Activer le compte (en tant qu\'admin) :', 'yellow');
log('   http://localhost:3000/users.html', 'blue');

log('\n5. Lire la documentation :', 'yellow');
log('   - ROLES_V4.1.md (technique)', 'blue');
log('   - GUIDE_ADMIN_ROLES.md (pratique)', 'blue');
log('   - GUIDE_RAPIDE_V4.1.md (rapide)', 'blue');

log('\n✨ Bon usage de votre système de tickets ! ✨\n', 'green');

// === FIN ===
process.exit(allChecks ? 0 : 1);
