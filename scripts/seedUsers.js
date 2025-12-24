/**
 * Database Seeding Script
 * Creates default admin and manager users
 * 
 * Usage: node scripts/seedUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../backend/src/config/env');
const User = require('../backend/src/models/User');
const logger = require('../backend/src/utils/logger');

const DEFAULT_USERS = [
  {
    nom: 'Admin',
    prenom: 'System',
    email: 'admin@example.com',
    password: 'AdminPass123',
    role: 'admin',
  },
  {
    nom: 'Manager',
    prenom: 'Event',
    email: 'manager@example.com',
    password: 'ManagerPass123',
    role: 'manager',
  },
];

async function seedDatabase() {
  try {
    // Connect to database
    logger.info('Seed', 'Connecting to MongoDB...');
    await mongoose.connect(config.DB_URI || require('../backend/src/config/database').buildConnectionString(), {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('Seed', 'Connected successfully');

    // Clear existing users (optional - comment out to preserve)
    // await User.deleteMany({});
    // logger.info('Seed', 'Cleared existing users');

    // Create default users
    for (const userData of DEFAULT_USERS) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        logger.info('Seed', `User already exists: ${userData.email}`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      logger.info('Seed', `Created user: ${userData.email} (${userData.role})`);
    }

    logger.info('Seed', '✅ Database seeding completed successfully');
    console.log('\n📝 Default Credentials:');
    console.log('   Admin:   admin@example.com / AdminPass123');
    console.log('   Manager: manager@example.com / ManagerPass123\n');

    process.exit(0);
  } catch (error) {
    logger.error('Seed', 'Seeding failed', error.message);
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
