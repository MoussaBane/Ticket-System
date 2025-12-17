/**
 * PM2 Ecosystem Configuration
 * Production process manager setup
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart ticket-system
 *   pm2 stop ticket-system
 *   pm2 logs ticket-system
 */

module.exports = {
  apps: [
    {
      name: 'ticket-system',
      script: './backend/server.js',
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: process.env.PM2_EXEC_MODE || 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
      // Graceful shutdown
      shutdown_with_message: true,
    },
  ],
};
