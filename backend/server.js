/**
 * Backend Server Entry Point
 * Initializes database connection and starts Express server
 */

const config = require('./src/config/env');
const { connectDatabase, disconnectDatabase } = require('./src/config/database');
const createApp = require('./src/app');
const logger = require('./src/utils/logger');

/**
 * Start the server
 */
async function startServer() {
  try {
    logger.info('Server', 'Starting application...');

    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start listening
    const PORT = config.PORT;
    app.listen(PORT, () => {
      logger.info('Server', `✅ Server running at http://localhost:${PORT}`);
      logger.info('Server', `📊 Health: http://localhost:${PORT}/health`);
      logger.info('Server', `🟢 Ready:  http://localhost:${PORT}/ready`);
      logger.info('Server', `🔧 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Server', '\n🛑 Shutting down gracefully...');
      await disconnectDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Server', '\n🛑 Shutting down gracefully...');
      await disconnectDatabase();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Server', 'Failed to start server', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
