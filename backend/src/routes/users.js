/**
 * User Routes
 * /api/users/*
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');

/**
 * GET /api/users
 * Get all users
 */
router.get('/', verifyToken, roleAuth('admin'), userController.getAllUsers);

/**
 * POST /api/users
 * Create new user
 */
router.post('/', verifyToken, roleAuth('admin'), userController.createUser);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', verifyToken, roleAuth('admin'), userController.getUserById);

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', verifyToken, roleAuth('admin'), userController.updateUser);

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete('/:id', verifyToken, roleAuth('admin'), userController.deleteUser);

/**
 * POST /api/users/:id/reset-password
 * Reset user password
 */
router.post('/:id/reset-password', verifyToken, roleAuth('admin'), userController.resetPassword);

module.exports = router;
