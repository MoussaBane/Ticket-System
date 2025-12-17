/**
 * Express Application Setup
 * Configures middleware and routes
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
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
  if (config.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  // Security headers with relaxed CSP for serving frontend with CDN resources
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'", 'cdn.jsdelivr.net'],
          fontSrc: ["'self'", 'cdn.jsdelivr.net'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  const allowedOrigins =
    config.CORS_ORIGINS && config.CORS_ORIGINS.length > 0 ? config.CORS_ORIGINS : [];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(compression());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  // Request logging middleware (simple)
  app.use((req, res, next) => {
    logger.debug('HTTP', `${req.method} ${req.path}`);
    next();
  });

  // =====================
  // ROUTES
  // =====================

  // Home page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'index.html'));
  });

  // Static HTML pages (catch any .html requests)
  app.get('/:page.html', (req, res) => {
    const filename = req.params.page;
    res.sendFile(
      path.join(__dirname, '..', '..', 'frontend', 'pages', `${filename}.html`),
      (err) => {
        if (err) {
          res.status(404).json({ success: false, message: 'Page not found', statusCode: 404 });
        }
      }
    );
  });

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Readiness check
  app.get('/ready', (req, res) => {
    const dbState = mongoose.connection.readyState; // 1 = connected
    const ready = dbState === 1;
    res.status(ready ? 200 : 503).json({
      success: ready,
      message: ready ? 'Ready' : 'Not ready',
      dbState,
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
