const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  isUsed: { type: Boolean, default: false }, // Présent à l'événement
  isAssigned: { type: Boolean, default: false }, // Ticket acheté/assigné
  assignedTo: { type: String, default: null }, // Nom de la personne
  assignedAt: { type: Date, default: null }, // Date d'assignation
  usedAt: { type: Date, default: null }, // Date de validation,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);
