const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    default: () => Math.floor(10000000 + Math.random() * 90000000).toString(),
  },
  isUsed: { type: Boolean, default: false },
  isAssigned: { type: Boolean, default: true },

  assignedTo: String,
  assignedEmail: String,
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },

  qrData: String,
  pdfUrl: String,

  sent: { type: Boolean, default: false },
  sentAt: Date,
  assignedAt: { type: Date, default: Date.now },
  usedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);

//const AutoIncrement = require("mongoose-sequence")(mongoose);
//ticketNumber: { type: Number, unique: true }, // Auto-incremented ticket number
// Auto-increment plugin for ticketNumber
//ticketSchema.plugin(AutoIncrement, { inc_field: "ticketNumber" });