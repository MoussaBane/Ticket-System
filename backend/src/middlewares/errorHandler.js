/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

const logger = require('../utils/logger');
const { sendError } = require('../utils/responseUtils');

/**
 * Global error handler middleware
 * Should be last middleware in app.use()
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('ErrorHandler', err.message, {
    status: err.status || 500,
    path: req.path,
    method: req.method,
  });

  // Default error
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // Send error response
  return sendError(res, message, status, process.env.NODE_ENV === 'development' ? err : null);
};

module.exports = errorHandler;
