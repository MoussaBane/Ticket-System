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
      serverSelectionTimeoutMS: 5000,
      // Disable autoIndex in production for performance
      autoIndex: config.NODE_ENV !== 'production',
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
  const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME } = config;

  if (!DB_USERNAME || !DB_PASSWORD) {
    return null;
  }

  // Prefer explicit host/name when provided
  if (DB_HOST && DB_NAME) {
    return `mongodb+srv://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(
      DB_PASSWORD
    )}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
  }

  // Fallback to default template; recommend using DB_URI in production
  return `mongodb+srv://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(
    DB_PASSWORD
  )}@cluster0.iele1xj.mongodb.net/?appName=Cluster0`;
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
