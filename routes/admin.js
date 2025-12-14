const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');
const Reservation = require('../models/Reservation');
const Ticket = require('../models/Ticket');
const { getNextSequence } = require('../services/counterService');
const { sendSuccess, sendError } = require('../utils/responseUtils');

/**
 * GET /api/admin/reservations
 * List all reservations with optional status filter
 */
router.get('/reservations', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    // Filter by status if provided
    if (status && ['PENDING', 'TICKET_CREATED', 'TICKET_SENT'].includes(status)) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('createdBy', 'nom prenom email')
      .populate('ticketId', 'code pdfUrl')
      .sort({ createdAt: 1 });

    return sendSuccess(res, reservations, 200, 'Réservations récupérées');
  } catch (err) {
    console.error('Error fetching reservations:', err);
    return sendError(
      res,
      'Erreur serveur lors de la récupération des réservations',
      500,
      err.message
    );
  }
});

/**
 * POST /api/admin/generate-tickets-from-reservations
 * Generate tickets for all PENDING reservations
 * Creates PDF and QR code for each ticket
 */
router.post(
  '/generate-tickets-from-reservations',
  verifyToken,
  roleAuth('admin'),
  async (req, res) => {
    try {
      const pending = await Reservation.find({ status: 'PENDING' });

      if (pending.length === 0) {
        return sendSuccess(res, { count: 0 }, 200, 'Aucune réservation en attente à traiter');
      }

      const createdTickets = [];
      const errors = [];

      for (const reservation of pending) {
        try {
          // Get next ticket number
          const ticketNo = await getNextSequence('ticketNo');

          // Create new ticket
          const ticket = new Ticket({
            ticketNo,
            code: Math.floor(100000 + Math.random() * 900000).toString(),
            isAssigned: true,
            assignedTo: reservation.holderName,
            assignedEmail: reservation.holderEmail,
            reservationId: reservation._id,
            ticketType: 'UNKNOWN',
          });

          // Save ticket to database
          await ticket.save();

          // Update reservation with ticket reference and new status
          reservation.ticketId = ticket._id;
          reservation.status = 'TICKET_CREATED';
          await reservation.save();

          createdTickets.push(ticket);
        } catch (ticketErr) {
          console.error(`Error creating ticket for reservation ${reservation._id}:`, ticketErr);
          errors.push(`Reservation ${reservation._id}: ${ticketErr.message}`);
        }
      }

      return sendSuccess(
        res,
        {
          count: createdTickets.length,
          total: pending.length,
          errors: errors.length > 0 ? errors : undefined,
        },
        200,
        `${createdTickets.length} tickets générés avec succès`
      );
    } catch (err) {
      console.error('Error generating tickets:', err);
      return sendError(res, 'Erreur serveur lors de la génération des tickets', 500, err.message);
    }
  }
);

module.exports = router;
