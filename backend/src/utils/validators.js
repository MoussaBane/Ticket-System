/**
 * Validation Utilities
 * Common data validation functions
 */

const constants = require('../config/constants');

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  if (!constants.VALIDATION.EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate password
 */
function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < constants.VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${constants.VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate required string field
 */
function validateRequiredString(value, fieldName) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Validate user role
 */
function validateRole(role) {
  const validRoles = Object.values(constants.USER_ROLES);

  if (!validRoles.includes(role)) {
    return { valid: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Validate ticket type
 */
function validateTicketType(type) {
  const validTypes = Object.values(constants.TICKET_TYPES);

  if (!validTypes.includes(type)) {
    return { valid: false, error: `Invalid ticket type. Must be one of: ${validTypes.join(', ')}` };
  }

  return { valid: true };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateRequiredString,
  validateRole,
  validateTicketType,
};
