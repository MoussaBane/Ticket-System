/**
 * Migration Script: Add ticketNo to all existing tickets
 * Uses manual counter system instead of mongoose-sequence
 * Run with: node scripts/migrateTicketNo.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const Counter = require("../models/Counter");

async function migrateTicketNo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ticket_system");
    console.log("✓ Connected to MongoDB");

    // Get all tickets sorted by createdAt
    const allTickets = await Ticket.find().sort({ createdAt: 1 });
    console.log(`Found ${allTickets.length} total tickets`);

    if (allTickets.length === 0) {
      console.log("✓ No tickets to migrate");
      // Initialize counter
      await Counter.findByIdAndUpdate(
        "ticketNo",
        { seq: 0 },
        { upsert: true }
      );
      console.log("✓ Counter initialized to 0");
      await mongoose.connection.close();
      return;
    }

    // Initialize or reset counter
    let counterValue = 0;
    await Counter.findByIdAndUpdate(
      "ticketNo",
      { seq: 0 },
      { upsert: true }
    );
    console.log("✓ Counter reset to 0");

    // Add ticketNo to all tickets
    console.log(`Adding ticketNo to ${allTickets.length} tickets...`);

    let updatedCount = 0;
    for (const ticket of allTickets) {
      counterValue++;
      await Ticket.findByIdAndUpdate(
        ticket._id,
        { ticketNo: counterValue },
        { new: true }
      );
      updatedCount++;

      if (updatedCount % 50 === 0) {
        console.log(`  ✓ Updated ${updatedCount}/${allTickets.length} tickets...`);
      }
    }

    // Update counter to the final value
    await Counter.findByIdAndUpdate(
      "ticketNo",
      { seq: counterValue },
      { upsert: true }
    );

    console.log(`\n✓ Migration complete!`);
    console.log(`  - ${updatedCount} tickets updated`);
    console.log(`  - Counter set to: ${counterValue}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateTicketNo();
