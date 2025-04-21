const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  isUsed: { type: Boolean, default: false },
  assignedTo: { type: String, default: null },
  usedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Ticket', ticketSchema);
