/**
 * JWT Utility Functions
 * Centralized JWT token generation and verification
 */

const { SignJWT, jwtVerify } = require('jose');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, email, role
 * @returns {Promise<string>} JWT token
 */
async function generateToken(user) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';

  if (!secret || process.env.JWT_SECRET.length === 0) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = await new SignJWT({
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
async function verifyJWT(token) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (!secret || process.env.JWT_SECRET.length === 0) {
    throw new Error('JWT_SECRET is not configured');
  }

  const { payload } = await jwtVerify(token, secret);
  return payload;
}

module.exports = {
  generateToken,
  verifyJWT,
};
