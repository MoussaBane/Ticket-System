/**
 * Authentication Controller
 * Handles authentication endpoints
 */

const authService = require('../services/authService');
const { sendSuccess, sendError, sendValidationError } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendValidationError(res, ['Email is required', 'Password is required']);
    }

    const result = await authService.login(email, password);
    return sendSuccess(res, result, 200, 'Login successful');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Login failed';
    return sendError(res, message, status);
  }
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { nom, prenom, email, password, role } = req.body;

    const user = await authService.register(nom, prenom, email, password, role);
    return sendSuccess(res, user, 201, 'Registration successful');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Registration failed';
    return sendError(res, message, status);
  }
}

module.exports = {
  login,
  register,
};
