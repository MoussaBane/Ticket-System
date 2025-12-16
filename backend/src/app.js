/**
 * Express Application Setup
 * Configures middleware and routes
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');

/**
 * Create and configure Express app
 */
function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware (simple)
  app.use((req, res, next) => {
    logger.debug('HTTP', `${req.method} ${req.path}`);
    next();
  });

  // =====================
  // ROUTES
  // =====================

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/users', userRoutes);

  // =====================
  // ERROR HANDLING
  // =====================

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
