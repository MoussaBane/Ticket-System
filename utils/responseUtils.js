/**
 * Standardized Response Utilities
 * Ensures consistent API response format across all endpoints
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to send
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Optional message
 */
function sendSuccess(res, data = null, statusCode = 200, message = 'Success') {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errorDetails - Optional error details for debugging
 */
function sendError(
  res,
  message = 'Internal server error',
  statusCode = 500,
  errorDetails = null
) {
  const response = {
    success: false,
    message,
  };

  // Only include error details in development
  if (process.env.NODE_ENV === 'development' && errorDetails) {
    response.error = errorDetails;
  }

  res.status(statusCode).json(response);
}

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {string|Array<string>} errors - Validation error messages
 */
function sendValidationError(res, errors) {
  const errorArray = Array.isArray(errors) ? errors : [errors];
  res.status(400).json({
    success: false,
    message: 'Validation échouée !',
    errors: errorArray,
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
};
