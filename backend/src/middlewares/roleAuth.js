/**
 * Role-Based Authorization Middleware
 * Checks if user has required role
 */

const { sendError } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Create role authorization middleware
 * @param {...string} requiredRoles - Roles that are allowed
 * @returns {Function} Express middleware
 */
const roleAuth = (...requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn('Auth', 'User not authenticated in roleAuth middleware');
        return sendError(res, 'User not authenticated', 401);
      }

      if (!requiredRoles.includes(req.user.role)) {
        logger.warn('Auth', `Access denied for role: ${req.user.role}`, {
          requiredRoles,
        });
        return sendError(
          res,
          `Access denied. Required role: ${requiredRoles.join(' or ')}`,
          403
        );
      }

      next();
    } catch (error) {
      logger.error('Auth', 'Role authorization failed', error.message);
      return sendError(res, 'Authorization error', 500);
    }
  };
};

module.exports = roleAuth;
