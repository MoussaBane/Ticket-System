/**
 * Token Verification Middleware
 * Extracts and validates JWT token from Authorization header
 */

const { verifyJWT } = require('../utils/jwtUtils');
const { sendError } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Verify JWT token from Authorization header
 * Attaches decoded user data to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Auth', 'Missing authorization token');
      return sendError(res, 'Authorization token is missing', 401);
    }

    const payload = await verifyJWT(token);
    req.user = payload;
    next();
  } catch (error) {
    logger.error('Auth', 'Token verification failed', error.message);
    return sendError(res, 'Invalid or expired token', 403);
  }
};

module.exports = verifyToken;
