/**
 * Authentication Routes
 * /api/auth/*
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const constants = require('../config/constants');

// Rate limiter
const loginLimiter = rateLimit({
  windowMs: constants.RATE_LIMITING.WINDOW_MS,
  max: constants.RATE_LIMITING.MAX_ATTEMPTS,
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', loginLimiter, authController.login);

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', authController.register);

module.exports = router;
