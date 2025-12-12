const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    default: () => Math.floor(100000 + Math.random() * 900000).toString(),
    index: true, // Index for faster lookups
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true,
  },
  isAssigned: {
    type: Boolean,
    default: false,
    index: true,
  },
  assignedTo: String,
  assignedEmail: String,
  assignedAt: Date,

  // Reference to reservation (for reservation-to-ticket workflow)
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
  },

  // PDF and QR code data
  qrData: String,
  pdfUrl: String,

  // Email sending tracking
  sent: {
    type: Boolean,
    default: false,
    index: true,
  },
  sentAt: Date,

  // Ticket usage tracking
  usedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient filtering
ticketSchema.index({ isAssigned: 1, isUsed: 1 });
ticketSchema.index({ reservationId: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
