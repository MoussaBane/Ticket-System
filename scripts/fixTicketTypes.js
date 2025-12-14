#!/usr/bin/env node
/**
 * Migration script: Fix invalid ticketType values
 * Sets all tickets with invalid/empty ticketType to 'NORMAL'
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

const main = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all tickets with invalid ticketType
    const invalidTickets = await Ticket.find({
      $or: [
        { ticketType: ' ' },
        { ticketType: '' },
        { ticketType: null },
        { ticketType: { $exists: false } }
      ]
    });

    console.log(`Found ${invalidTickets.length} tickets with invalid ticketType`);

    if (invalidTickets.length > 0) {
      // Update all invalid tickets to 'NORMAL'
      const result = await Ticket.updateMany(
        {
          $or: [
            { ticketType: ' ' },
            { ticketType: '' },
            { ticketType: null },
            { ticketType: { $exists: false } }
          ]
        },
        { ticketType: 'NORMAL' }
      );

      console.log(`Updated ${result.modifiedCount} tickets to ticketType: 'NORMAL'`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

main();
