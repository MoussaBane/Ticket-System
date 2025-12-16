/**
 * Logger Utility
 * Centralized logging with level support
 */

const config = require('../config/env');

const LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format log message with timestamp
 */
function formatLog(level, context, message, data = null) {
  const timestamp = new Date().toISOString();
  let log = `[${timestamp}] [${level}] [${context}] ${message}`;

  if (data) {
    log += ` ${JSON.stringify(data)}`;
  }

  return log;
}

/**
 * Get appropriate console method
 */
function getConsoleMethod(level) {
  switch (level) {
    case LEVELS.ERROR:
      return console.error;
    case LEVELS.WARN:
      return console.warn;
    case LEVELS.DEBUG:
      return console.debug;
    default:
      return console.log;
  }
}

/**
 * Logger object
 */
const logger = {
  error: (context, message, data) => {
    const log = formatLog(LEVELS.ERROR, context, message, data);
    getConsoleMethod(LEVELS.ERROR)(log);
  },

  warn: (context, message, data) => {
    const log = formatLog(LEVELS.WARN, context, message, data);
    getConsoleMethod(LEVELS.WARN)(log);
  },

  info: (context, message, data) => {
    const log = formatLog(LEVELS.INFO, context, message, data);
    getConsoleMethod(LEVELS.INFO)(log);
  },

  debug: (context, message, data) => {
    if (config.NODE_ENV === 'development') {
      const log = formatLog(LEVELS.DEBUG, context, message, data);
      getConsoleMethod(LEVELS.DEBUG)(log);
    }
  },
};

module.exports = logger;
