const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    default: () => Math.floor(10000000 + Math.random() * 90000000).toString(),
  }, // Génère un code de 8 chiffres
  isUsed: { type: Boolean, default: false }, // Présent à l'événement
  isAssigned: { type: Boolean, default: false }, // Ticket acheté/assigné
  assignedTo: { type: String, default: null }, // Nom de la personne
  assignedAt: { type: Date, default: null }, // Date d'assignation
  usedAt: { type: Date, default: null }, // Date de validation,
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Ticket", ticketSchema);

//const AutoIncrement = require("mongoose-sequence")(mongoose);
//ticketNumber: { type: Number, unique: true }, // Auto-incremented ticket number
// Auto-increment plugin for ticketNumber
//ticketSchema.plugin(AutoIncrement, { inc_field: "ticketNumber" });