/**
 * Response Utilities
 * Standardized API response format
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to send
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Response message
 */
function sendSuccess(res, data = null, statusCode = 200, message = 'Success') {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    statusCode,
  });
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errorDetails - Optional error details (development only)
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
    statusCode,
  };

  // Include error details only in development
  if (process.env.NODE_ENV === 'development' && errorDetails) {
    response.error = errorDetails;
  }

  res.status(statusCode).json(response);
}

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {string|Array<string>} errors - Error message(s)
 */
function sendValidationError(res, errors) {
  const errorArray = Array.isArray(errors) ? errors : [errors];

  res.status(400).json({
    success: false,
    message: 'Validation error',
    errors: errorArray,
    statusCode: 400,
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
};
