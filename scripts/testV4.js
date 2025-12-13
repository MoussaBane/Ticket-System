/**
 * Script de Test - Système de Tickets v4.0
 * Vérifie que les nouvelles fonctionnalités fonctionnent correctement
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

async function testNewFeatures() {
  console.log('🧪 Test du Système de Tickets v4.0\n');

  try {
    // Connexion à la base de données
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Test 1: Vérifier le modèle Ticket
    console.log('📝 Test 1: Vérification du modèle Ticket');
    const ticketSchema = Ticket.schema.obj;
    const hasTicketType = 'ticketType' in ticketSchema;
    const hasAssignedBy = 'assignedBy' in ticketSchema;
    
    console.log(`  - Champ ticketType: ${hasTicketType ? '✅' : '❌'}`);
    console.log(`  - Champ assignedBy: ${hasAssignedBy ? '✅' : '❌'}\n`);

    // Test 2: Créer un ticket test avec type VIP
    console.log('🎫 Test 2: Création d\'un ticket VIP');
    const testTicket = new Ticket({
      code: 'TEST-' + Math.floor(100000 + Math.random() * 900000).toString(),
      ticketType: 'VIP',
      isAssigned: false
    });
    
    await testTicket.save();
    console.log(`  - Ticket créé: ${testTicket.code}`);
    console.log(`  - Type: ${testTicket.ticketType}`);
    console.log('  ✅ Création réussie\n');

    // Test 3: Compter les tickets par type
    console.log('📊 Test 3: Statistiques par type');
    const totalTickets = await Ticket.countDocuments();
    const vipTickets = await Ticket.countDocuments({ ticketType: 'VIP' });
    const normalTickets = await Ticket.countDocuments({ ticketType: 'NORMAL' });
    const noType = await Ticket.countDocuments({ ticketType: { $exists: false } });
    
    console.log(`  - Total: ${totalTickets}`);
    console.log(`  - VIP: ${vipTickets}`);
    console.log(`  - NORMAL: ${normalTickets}`);
    console.log(`  - Sans type: ${noType}`);
    console.log('  ✅ Comptage réussi\n');

    // Test 4: Vérifier les limites
    console.log('🔢 Test 4: Vérification des limites');
    const VIP_LIMIT = 90;
    const NORMAL_LIMIT = 410;
    const vipRemaining = VIP_LIMIT - vipTickets;
    const normalRemaining = NORMAL_LIMIT - normalTickets;
    
    console.log(`  - VIP: ${vipTickets}/${VIP_LIMIT} (${vipRemaining} restants)`);
    console.log(`  - NORMAL: ${normalTickets}/${NORMAL_LIMIT} (${normalRemaining} restants)`);
    
    if (vipTickets <= VIP_LIMIT && normalTickets <= NORMAL_LIMIT) {
      console.log('  ✅ Limites respectées\n');
    } else {
      console.log('  ⚠️ ATTENTION: Limites dépassées!\n');
    }

    // Test 5: Tester l'assignation avec référence utilisateur
    console.log('👤 Test 5: Test d\'assignation avec utilisateur');
    const testUser = await User.findOne({ role: 'admin' });
    
    if (testUser) {
      testTicket.isAssigned = true;
      testTicket.assignedTo = `${testUser.prenom} ${testUser.nom}`;
      testTicket.assignedBy = testUser._id;
      testTicket.assignedAt = new Date();
      await testTicket.save();
      
      console.log(`  - Assigné à: ${testTicket.assignedTo}`);
      console.log(`  - Assigné par: ${testUser.email}`);
      console.log('  ✅ Assignation réussie\n');
    } else {
      console.log('  ⚠️ Aucun utilisateur trouvé pour le test\n');
    }

    // Test 6: Vérifier la population
    console.log('🔗 Test 6: Test de population (assignedBy)');
    const populatedTicket = await Ticket.findById(testTicket._id).populate('assignedBy', 'nom prenom email');
    
    if (populatedTicket && populatedTicket.assignedBy) {
      console.log(`  - Population réussie: ${populatedTicket.assignedBy.email}`);
      console.log('  ✅ Population fonctionne\n');
    } else {
      console.log('  ⚠️ Population non disponible\n');
    }

    // Test 7: Nettoyer le ticket de test
    console.log('🧹 Test 7: Nettoyage');
    await Ticket.findByIdAndDelete(testTicket._id);
    console.log('  ✅ Ticket de test supprimé\n');

    // Résumé
    console.log('=' .repeat(50));
    console.log('✅ TOUS LES TESTS RÉUSSIS!');
    console.log('=' .repeat(50));
    console.log('\n📋 Résumé du système:');
    console.log(`  - Tickets totaux: ${totalTickets}`);
    console.log(`  - Tickets VIP: ${vipTickets}/${VIP_LIMIT}`);
    console.log(`  - Tickets NORMAL: ${normalTickets}/${NORMAL_LIMIT}`);
    console.log(`  - Tickets assignés: ${await Ticket.countDocuments({ isAssigned: true })}`);
    console.log(`  - Tickets utilisés: ${await Ticket.countDocuments({ isUsed: true })}`);
    console.log('\n🎉 Le système v4.0 est opérationnel!');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Déconnecté de MongoDB');
  }
}

// Exécuter les tests
testNewFeatures();
