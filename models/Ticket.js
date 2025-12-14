const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketNo: {
      type: Number,
      unique: true,
      sparse: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
      default: () => Math.floor(100000 + Math.random() * 900000).toString(),
      index: true,
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
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ticketType: {
      type: String,
      enum: ['VIP', 'NORMAL', 'UNKNOWN'],
      default: 'UNKNOWN',
      index: true,
    },

    // Reference to reservation (for reservation-to-ticket workflow)
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },

    // Download tracking
    isDownloaded: {
      type: Boolean,
      default: false,
      index: true,
    },
    downloadedAt: Date,

    // Ticket usage tracking
    usedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { collection: 'tickets' }
);

// Compound index for efficient filtering
ticketSchema.index({ isAssigned: 1, isUsed: 1 });
ticketSchema.index({ reservationId: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
