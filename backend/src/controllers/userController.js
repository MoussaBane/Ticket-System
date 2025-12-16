/**
 * User Controller
 * Handles user management endpoints
 */

const userService = require('../services/userService');
const { sendSuccess, sendError, sendValidationError } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * GET /api/users
 */
async function getAllUsers(req, res) {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role);
    return sendSuccess(res, users, 200, 'Users retrieved');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to get users';
    return sendError(res, message, status);
  }
}

/**
 * GET /api/users/:id
 */
async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user, 200, 'User retrieved');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to get user';
    return sendError(res, message, status);
  }
}

/**
 * POST /api/users
 */
async function createUser(req, res) {
  try {
    const { nom, prenom, email, password, role } = req.body;
    const user = await userService.createUser(nom, prenom, email, password, role);
    return sendSuccess(res, user, 201, 'User created');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to create user';
    return sendError(res, message, status);
  }
}

/**
 * PUT /api/users/:id
 */
async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, user, 200, 'User updated');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to update user';
    return sendError(res, message, status);
  }
}

/**
 * DELETE /api/users/:id
 */
async function deleteUser(req, res) {
  try {
    const result = await userService.deleteUser(req.params.id);
    return sendSuccess(res, result, 200, 'User deleted');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to delete user';
    return sendError(res, message, status);
  }
}

/**
 * POST /api/users/:id/reset-password
 */
async function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return sendValidationError(res, 'New password is required');
    }

    const result = await userService.resetPassword(req.params.id, newPassword);
    return sendSuccess(res, result, 200, 'Password reset');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to reset password';
    return sendError(res, message, status);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
};
