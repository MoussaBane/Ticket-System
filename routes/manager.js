const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');
const Reservation = require('../models/Reservation');

// Create a single reservation (manager or admin)
router.post('/reservations', verifyToken, roleAuth('manager','admin'), async (req, res) => {
  try {
    const { buyerName, buyerEmail, buyerPhone, holderName, holderEmail } = req.body;
    if (!buyerName || !buyerEmail || !holderName || !holderEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const reservation = new Reservation({
      buyerName, buyerEmail, buyerPhone, holderName, holderEmail,
      createdBy: req.user.id
    });

    await reservation.save();
    res.status(201).json({ success: true, reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Import CSV (simple parser)
router.post('/import-reservations', verifyToken, roleAuth('manager','admin'), express.text({ type: 'text/*', limit: '5mb' }), async (req, res) => {
  try {
    const csv = req.body;
    if (!csv) return res.status(400).json({ message: 'CSV content required in request body' });

    const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const created = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      // expect: buyerName,buyerEmail,buyerPhone,holderName,holderEmail
      if (parts.length < 5) continue;
      const [buyerName, buyerEmail, buyerPhone, holderName, holderEmail] = parts;
      const reservation = new Reservation({ buyerName, buyerEmail, buyerPhone, holderName, holderEmail, createdBy: req.user.id });
      await reservation.save();
      created.push(reservation);
    }

    res.json({ success: true, count: created.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List reservations created by current user (manager)
router.get('/reservations', verifyToken, roleAuth('manager','admin'), async (req, res) => {
  try {
    const reservations = await Reservation.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
