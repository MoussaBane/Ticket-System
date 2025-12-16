/**
 * Ticket Routes
 * /api/tickets/*
 */

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');

/**
 * GET /api/tickets/stats
 * Get ticket statistics
 */
router.get('/stats', verifyToken, roleAuth('admin', 'manager'), ticketController.getTicketStats);

/**
 * POST /api/tickets/generate
 * Generate bulk tickets
 */
router.post('/generate', verifyToken, roleAuth('admin'), ticketController.generateTickets);

/**
 * POST /api/tickets/validate
 * Validate ticket by code
 */
router.post('/validate', verifyToken, roleAuth('admin', 'manager'), ticketController.validateTicket);

/**
 * POST /api/tickets/assign
 * Assign single ticket
 */
router.post('/assign', verifyToken, roleAuth('admin', 'manager'), ticketController.assignTicket);

/**
 * POST /api/tickets/assign-bulk
 * Assign multiple tickets
 */
router.post(
  '/assign-bulk',
  verifyToken,
  roleAuth('admin', 'manager'),
  ticketController.assignTicketsBulk
);

module.exports = router;
