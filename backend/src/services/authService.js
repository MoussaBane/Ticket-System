/**
 * Authentication Service
 * Business logic for authentication
 */

const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const logger = require('../utils/logger');

/**
 * Login user
 */
async function login(email, password) {
  try {
    if (!email || !password) {
      throw {
        message: 'Email and password are required',
        status: 400,
      };
    }

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw {
        message: 'Invalid email or password',
        status: 401,
      };
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw {
        message: 'Invalid email or password',
        status: 401,
      };
    }

    // Verify user is admin or manager
    if (!['admin', 'manager'].includes(user.role)) {
      throw {
        message: 'Access denied. Only admins and managers can login',
        status: 403,
      };
    }

    // Generate token
    const token = await generateToken(user);

    logger.info('AuthService', `User logged in: ${email}`);

    // Return user without password
    const userData = user.toObject();
    delete userData.password;

    return {
      token,
      user: userData,
    };
  } catch (error) {
    logger.error('AuthService', 'Login failed', error.message);
    throw error;
  }
}

/**
 * Register new user
 */
async function register(nom, prenom, email, password, role = 'normal') {
  try {
    // Validate input
    if (!nom || !prenom || !email || !password) {
      throw {
        message: 'All fields are required (nom, prenom, email, password)',
        status: 400,
      };
    }

    if (password.length < 8) {
      throw {
        message: 'Password must be at least 8 characters',
        status: 400,
      };
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw {
        message: 'Email already registered',
        status: 409,
      };
    }

    // Create new user
    const newUser = new User({
      nom,
      prenom,
      email,
      password,
      role,
    });

    await newUser.save();

    logger.info('AuthService', `New user registered: ${email}`);

    // Return user without password
    const userData = newUser.toObject();
    delete userData.password;

    return userData;
  } catch (error) {
    logger.error('AuthService', 'Registration failed', error.message);
    throw error;
  }
}

/**
 * Verify token (for API validation)
 */
async function verifyUserToken(decoded) {
  try {
    if (!decoded || !decoded.id) {
      throw {
        message: 'Invalid token payload',
        status: 401,
      };
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      };
    }

    return user.toObject();
  } catch (error) {
    logger.error('AuthService', 'Token verification failed', error.message);
    throw error;
  }
}

module.exports = {
  login,
  register,
  verifyUserToken,
};
