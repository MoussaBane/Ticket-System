const mongoose = require('mongoose');
require('dotenv').config();
const Ticket = require('./models/Ticket');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost/ticket_system');
    const tickets = await Ticket.find().limit(5).lean();
    
    console.log('=== TICKETS FROM DATABASE ===\n');
    tickets.forEach((t, i) => {
      console.log(`Ticket ${i+1}:`);
      console.log('  _id:', t._id);
      console.log('  code:', t.code);
      console.log('  ticketNo:', t.ticketNo);
      console.log('  ticketType:', t.ticketType);
      console.log('  isAssigned:', t.isAssigned);
      console.log('');
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
