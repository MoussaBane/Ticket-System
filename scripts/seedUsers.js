require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  // Allow providing a full MongoDB URI via DB_URI or DB_URL, otherwise build from username/password
  const uri = process.env.DB_URI || process.env.DB_URL || `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pznxahw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  try {
    const safeDisplay = uri.replace(process.env.DB_PASSWORD || '', '***');
    console.log('Connecting to MongoDB using URI:', safeDisplay);
  } catch (e) {
    console.log('Connecting to MongoDB (URI hidden)');
  }
  await mongoose.connect(uri);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASS || 'AdminPass123';
  const managerEmail = process.env.SEED_MANAGER_EMAIL || 'manager@example.com';
  const managerPassword = process.env.SEED_MANAGER_PASS || 'ManagerPass123';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const admin = new User({ nom: 'Admin', prenom: 'User', email: adminEmail, password: adminPassword, role: 'admin' });
    await admin.save();
    console.log('Admin user created:', adminEmail, 'password:', adminPassword);
  } else console.log('Admin already exists:', adminEmail);

  const existingManager = await User.findOne({ email: managerEmail });
  if (!existingManager) {
    const manager = new User({ nom: 'Manager', prenom: 'User', email: managerEmail, password: managerPassword, role: 'manager' });
    await manager.save();
    console.log('Manager user created:', managerEmail, 'password:', managerPassword);
  } else console.log('Manager already exists:', managerEmail);

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
