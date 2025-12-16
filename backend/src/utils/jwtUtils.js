/**
 * JWT Utility Functions
 * Centralized JWT token generation and verification
 */

const { SignJWT, jwtVerify } = require('jose');
const config = require('../config/env');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, email, role
 * @returns {Promise<string>} JWT token
 */
async function generateToken(user) {
  try {
    const secret = new TextEncoder().encode(config.JWT_SECRET);

    const token = await new SignJWT({
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(config.JWT_EXPIRES_IN)
      .sign(secret);

    return token;
  } catch (error) {
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded payload
 */
async function verifyJWT(token) {
  try {
    const secret = new TextEncoder().encode(config.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

module.exports = {
  generateToken,
  verifyJWT,
};
