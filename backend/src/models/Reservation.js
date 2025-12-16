const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReservationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: false },
  buyerName: String,
  buyerEmail: String,
  buyerPhone: String,
  holderName: String,
  holderEmail: String,
  ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', default: null },
  status: {
    type: String,
    enum: ['PENDING', 'TICKET_CREATED', 'TICKET_SENT'],
    default: 'PENDING',
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reservation', ReservationSchema);
