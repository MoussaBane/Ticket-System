const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');
const Reservation = require('../models/Reservation');
const Ticket = require('../models/Ticket');
const { generateTicketPdf } = require('../services/ticketPdfService');
const { sendTicketMail } = require('../services/mailService');
const { getNextSequence } = require("../services/counterService");
const { sendSuccess, sendError } = require("../utils/responseUtils");

/**
 * GET /api/admin/reservations
 * List all reservations with optional status filter
 */
router.get(
  "/reservations",
  verifyToken,
  roleAuth("admin"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const query = {};

      // Filter by status if provided
      if (
        status &&
        ["PENDING", "TICKET_CREATED", "TICKET_SENT"].includes(status)
      ) {
        query.status = status;
      }

      const reservations = await Reservation.find(query)
        .populate('createdBy', 'nom prenom email')
        .populate('ticketId', 'code pdfUrl')
        .sort({ createdAt: 1 });

      return sendSuccess(res, reservations, 200, "Reservations retrieved");
    } catch (err) {
      console.error("Error fetching reservations:", err);
      return sendError(
        res,
        "Server error while fetching reservations",
        500,
        err.message
      );
    }
  }
);

/**
 * POST /api/admin/generate-tickets-from-reservations
 * Generate tickets for all PENDING reservations
 * Creates PDF and QR code for each ticket
 */
router.post(
  "/generate-tickets-from-reservations",
  verifyToken,
  roleAuth("admin"),
  async (req, res) => {
    try {
      const pending = await Reservation.find({ status: "PENDING" });

      if (pending.length === 0) {
        return sendSuccess(
          res,
          { count: 0 },
          200,
          "No pending reservations to process"
        );
      }

      const createdTickets = [];
      const errors = [];

      for (const reservation of pending) {
        try {
          // Get next ticket number
          const ticketNo = await getNextSequence("ticketNo");

          // Create new ticket
          const ticket = new Ticket({
            ticketNo,
            code: Math.floor(100000 + Math.random() * 900000).toString(),
            isAssigned: true,
            assignedTo: reservation.holderName,
            assignedEmail: reservation.holderEmail,
            reservationId: reservation._id,
            ticketType: 'NORMAL',
          });

          // Generate PDF with QR code
          const { publicUrl, qrData } = await generateTicketPdf(ticket);
          ticket.pdfUrl = publicUrl;
          ticket.qrData = qrData;

          // Save ticket to database
          await ticket.save();

          // Update reservation with ticket reference and new status
          reservation.ticketId = ticket._id;
          reservation.status = "TICKET_CREATED";
          await reservation.save();

          createdTickets.push(ticket);
        } catch (ticketErr) {
          console.error(
            `Error creating ticket for reservation ${reservation._id}:`,
            ticketErr
          );
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
        `Generated ${createdTickets.length} tickets successfully`
      );
    } catch (err) {
      console.error("Error generating tickets:", err);
      return sendError(
        res,
        "Server error while generating tickets",
        500,
        err.message
      );
    }
  }
);

/**
 * POST /api/admin/send-tickets-from-reservations
 * Send emails for all TICKET_CREATED reservations
 * Updates ticket status to 'sent' and reservation to 'TICKET_SENT'
 */
router.post(
  "/send-tickets-from-reservations",
  verifyToken,
  roleAuth("admin"),
  async (req, res) => {
    try {
      const toSend = await Reservation.find({
        status: "TICKET_CREATED",
      }).populate("ticketId");

      if (toSend.length === 0) {
        return sendSuccess(res, { sent: 0 }, 200, "No tickets to send");
      }

      let sentCount = 0;
      const errors = [];

      for (const reservation of toSend) {
        try {
          const ticket = await Ticket.findById(reservation.ticketId);

          if (!ticket) {
            errors.push(`Reservation ${reservation._id}: Ticket not found`);
            continue;
          }

          // Send email with ticket
          await sendTicketMail(ticket);

          // Mark ticket as sent
          ticket.sent = true;
          ticket.sentAt = new Date();
          await ticket.save();

          // Update reservation status
          reservation.status = "TICKET_SENT";
          await reservation.save();

          sentCount++;
        } catch (sendErr) {
          console.error(
            `Error sending ticket for reservation ${reservation._id}:`,
            sendErr
          );
          errors.push(`Reservation ${reservation._id}: ${sendErr.message}`);
        }
      }

      return sendSuccess(
        res,
        {
          sent: sentCount,
          total: toSend.length,
          errors: errors.length > 0 ? errors : undefined,
        },
        200,
        `Sent ${sentCount} tickets successfully`
      );
    } catch (err) {
      console.error("Error sending tickets:", err);
      return sendError(
        res,
        "Server error while sending tickets",
        500,
        err.message
      );
    }
  }
);

module.exports = router;
