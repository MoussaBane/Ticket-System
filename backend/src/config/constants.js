/**
 * Application Constants
 * Shared constants across the application
 */

module.exports = {
  // Ticket Types
  TICKET_TYPES: {
    VIP: 'VIP',
    NORMAL: 'NORMAL',
    UNKNOWN: 'UNKNOWN',
  },

  // Reservation Statuses
  RESERVATION_STATUS: {
    PENDING: 'PENDING',
    TICKET_CREATED: 'TICKET_CREATED',
    TICKET_SENT: 'TICKET_SENT',
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    NORMAL: 'normal',
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TICKET_CODE_LENGTH: 6,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Rate Limiting
  RATE_LIMITING: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_CSV_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_EXTENSIONS: ['csv', 'xlsx'],
  },

  // QR Code
  QR_CODE: {
    ERROR_CORRECTION: 'H',
    TYPE: 'image/png',
  },
};
