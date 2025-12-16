/**
 * Database Configuration
 * MongoDB connection setup
 */

const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB
 * Supports both URI and username/password formats
 */
async function connectDatabase() {
  try {
    const mongoUri = config.DB_URI || buildConnectionString();

    if (!mongoUri) {
      throw new Error('No valid MongoDB connection string provided');
    }

    console.log(`[Database] Connecting to MongoDB...`);

    const connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`[Database] Connected successfully: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    throw error;
  }
}

/**
 * Build MongoDB connection string from username and password
 */
function buildConnectionString() {
  const { DB_USERNAME, DB_PASSWORD } = config;

  if (!DB_USERNAME || !DB_PASSWORD) {
    return null;
  }

  // Using MongoDB Atlas or standard connection
  // Adjust as needed for your environment
  return `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.xxxxx.mongodb.net/ticket_system?retryWrites=true&w=majority`;
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('[Database] Disconnected successfully');
  } catch (error) {
    console.error('[Database] Disconnection failed:', error.message);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
