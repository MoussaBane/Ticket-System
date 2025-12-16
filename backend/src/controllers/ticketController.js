/**
 * Ticket Controller
 * Handles ticket endpoints
 */

const ticketService = require('../services/ticketService');
const { sendSuccess, sendError, sendValidationError } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * POST /api/tickets/generate
 */
async function generateTickets(req, res) {
  try {
    const { count = 200, ticketType = 'UNKNOWN' } = req.body;

    const result = await ticketService.generateTickets(count, ticketType);
    return sendSuccess(res, result, 201, 'Tickets generated successfully');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to generate tickets';
    return sendError(res, message, status);
  }
}

/**
 * POST /api/tickets/validate
 */
async function validateTicket(req, res) {
  try {
    const { code } = req.body;

    const result = await ticketService.validateTicket(code);

    const status = result.alreadyUsed ? 200 : 200;
    const message = result.message;

    return sendSuccess(res, result, status, message);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to validate ticket';
    return sendError(res, message, status);
  }
}

/**
 * POST /api/tickets/assign
 */
async function assignTicket(req, res) {
  try {
    const { ticketId, ticketType } = req.body;
    const userId = req.user.id;
    const userName = `${req.user.prenom || ''} ${req.user.nom || ''}`.trim() || req.user.email;

    const ticket = await ticketService.assignTicket(ticketId, ticketType, userName, userId);

    return sendSuccess(res, ticket, 200, 'Ticket assigned successfully');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to assign ticket';
    return sendError(res, message, status);
  }
}

/**
 * POST /api/tickets/assign-bulk
 */
async function assignTicketsBulk(req, res) {
  try {
    const { count, ticketType } = req.body;
    const userId = req.user.id;
    const userName = `${req.user.prenom || ''} ${req.user.nom || ''}`.trim() || req.user.email;

    const result = await ticketService.assignTicketsBulk(count, ticketType, userName, userId);

    return sendSuccess(res, result, 200, `${result.assigned} tickets assigned`);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to assign tickets';
    return sendError(res, message, status);
  }
}

/**
 * GET /api/tickets/stats
 */
async function getTicketStats(req, res) {
  try {
    const stats = await ticketService.getTicketStats();
    return sendSuccess(res, stats, 200, 'Statistics retrieved');
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Failed to get statistics';
    return sendError(res, message, status);
  }
}

module.exports = {
  generateTickets,
  validateTicket,
  assignTicket,
  assignTicketsBulk,
  getTicketStats,
};
