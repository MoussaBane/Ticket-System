const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');
const Reservation = require('../models/Reservation');
const Ticket = require('../models/Ticket');
const { generateTicketPdf } = require('../services/ticketPdfService');
const { sendTicketMail } = require('../services/mailService');

// List all reservations (filter by status optional)
router.get('/reservations', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const reservations = await Reservation.find(query).populate('createdBy', 'nom prenom email').sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate tickets from all PENDING reservations
router.post('/generate-tickets-from-reservations', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const pending = await Reservation.find({ status: 'PENDING' });
    const createdTickets = [];

    for (const r of pending) {
      // create ticket
      const ticket = new Ticket({
        code: Math.floor(10000000 + Math.random() * 90000000).toString(),
        isAssigned: true,
        assignedTo: r.holderName,
        assignedEmail: r.holderEmail,
        reservationId: r._id
      });

      // generate pdf & qr
      const { publicUrl, qrData } = await generateTicketPdf(ticket);
      ticket.pdfUrl = publicUrl;
      ticket.qrData = qrData;

      await ticket.save();

      r.ticketId = ticket._id;
      r.status = 'TICKET_CREATED';
      await r.save();

      createdTickets.push(ticket);
    }

    res.json({ success: true, count: createdTickets.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send tickets for all TICKET_CREATED reservations
router.post('/send-tickets-from-reservations', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const list = await Reservation.find({ status: 'TICKET_CREATED' }).populate('ticketId');
    let sentCount = 0;

    for (const r of list) {
      const ticket = await Ticket.findById(r.ticketId);
      if (!ticket) continue;

      await sendTicketMail(ticket);
      ticket.sent = true;
      ticket.sentAt = new Date();
      await ticket.save();

      r.status = 'TICKET_SENT';
      await r.save();
      sentCount++;
    }

    res.json({ success: true, sent: sentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
