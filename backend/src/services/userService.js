/**
 * User Service
 * Business logic for user management
 */

const User = require('../models/User');
const logger = require('../utils/logger');
const constants = require('../config/constants');

/**
 * Get all users
 */
async function getAllUsers(role = null) {
  try {
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password');

    logger.info('UserService', `Retrieved ${users.length} users`);

    return users;
  } catch (error) {
    logger.error('UserService', 'Failed to get users', error.message);
    throw error;
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  try {
    if (!userId) {
      throw {
        message: 'User ID is required',
        status: 400,
      };
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      };
    }

    return user.toObject();
  } catch (error) {
    logger.error('UserService', 'Failed to get user', error.message);
    throw error;
  }
}

/**
 * Create new user
 */
async function createUser(nom, prenom, email, password, role = 'normal') {
  try {
    // Validate
    if (!nom || !prenom || !email || !password) {
      throw {
        message: 'All fields are required',
        status: 400,
      };
    }

    if (password.length < 8) {
      throw {
        message: 'Password must be at least 8 characters',
        status: 400,
      };
    }

    if (!Object.values(constants.USER_ROLES).includes(role)) {
      throw {
        message: 'Invalid role',
        status: 400,
      };
    }

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      throw {
        message: 'Email already registered',
        status: 409,
      };
    }

    // Create user
    const user = new User({
      nom,
      prenom,
      email,
      password,
      role,
    });

    await user.save();

    logger.info('UserService', `New user created: ${email}`);

    const userData = user.toObject();
    delete userData.password;

    return userData;
  } catch (error) {
    logger.error('UserService', 'Failed to create user', error.message);
    throw error;
  }
}

/**
 * Update user
 */
async function updateUser(userId, updates) {
  try {
    if (!userId) {
      throw {
        message: 'User ID is required',
        status: 400,
      };
    }

    // Don't allow direct password updates here
    delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select(
      '-password'
    );

    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      };
    }

    logger.info('UserService', `User updated: ${userId}`);

    return user.toObject();
  } catch (error) {
    logger.error('UserService', 'Failed to update user', error.message);
    throw error;
  }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
  try {
    if (!userId) {
      throw {
        message: 'User ID is required',
        status: 400,
      };
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      };
    }

    logger.info('UserService', `User deleted: ${userId}`);

    return { message: 'User deleted successfully' };
  } catch (error) {
    logger.error('UserService', 'Failed to delete user', error.message);
    throw error;
  }
}

/**
 * Reset user password
 */
async function resetPassword(userId, newPassword) {
  try {
    if (!userId || !newPassword) {
      throw {
        message: 'User ID and new password are required',
        status: 400,
      };
    }

    if (newPassword.length < 8) {
      throw {
        message: 'Password must be at least 8 characters',
        status: 400,
      };
    }

    const user = await User.findById(userId);

    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      };
    }

    user.password = newPassword;
    await user.save();

    logger.info('UserService', `Password reset for user: ${userId}`);

    return { message: 'Password reset successfully' };
  } catch (error) {
    logger.error('UserService', 'Failed to reset password', error.message);
    throw error;
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
