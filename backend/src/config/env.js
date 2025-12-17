/**
 * Environment Configuration
 * Centralized environment variables with validation
 */

require('dotenv').config();

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',

  // Database - Supports both DB_URI and DB_URL
  DB_URI: process.env.DB_URI || process.env.DB_URL,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3h',

  // Seed Users (Development)
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
  SEED_ADMIN_PASS: process.env.SEED_ADMIN_PASS || 'AdminPass123',
  SEED_MANAGER_EMAIL: process.env.SEED_MANAGER_EMAIL || 'manager@example.com',
  SEED_MANAGER_PASS: process.env.SEED_MANAGER_PASS || 'ManagerPass123',

  // Features
  ENABLE_SEEDING: process.env.ENABLE_SEEDING === 'true',

  // CORS
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};

/**
 * Validate critical environment variables
 */
function validateConfig() {
  const errors = [];

  if (!config.JWT_SECRET) {
    errors.push('JWT_SECRET is not configured');
  } else if (config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  }

  if (!config.DB_URI && (!config.DB_USERNAME || !config.DB_PASSWORD)) {
    errors.push('Either DB_URI or DB_USERNAME/DB_PASSWORD must be configured');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}

// Validate on startup
if (config.NODE_ENV === 'production') {
  validateConfig();
}

module.exports = config;
