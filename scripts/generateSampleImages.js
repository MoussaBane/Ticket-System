const path = require('path');
const fs = require('fs');
const { generateTicketImage } = require('../services/ticketImageService');

async function run() {
  try {
    const samples = [
      { ticket: { code: '123456', ticketType: 'VIP', ticketNo: 1, assignedTo: 'Test User' }, template: 'VIP' },
      { ticket: { code: '234567', ticketType: 'NORMAL', ticketNo: 2, assignedTo: 'Test User' }, template: 'NORMAL' },
      { ticket: { code: '345678', ticketType: 'VIP', ticketNo: 3, assignedTo: 'Test User' }, template: 'VIP' },
      { ticket: { code: '456789', ticketType: 'NORMAL', ticketNo: 4, assignedTo: 'Test User' }, template: 'NORMAL' },
    ];

    for (const s of samples) {
      const { filePath, publicUrl } = await generateTicketImage(s.ticket, s.template);
      console.log('Generated:', filePath, '->', publicUrl);
    }

    console.log('Done. Check public/tickets/images for output PNGs.');
  } catch (err) {
    console.error('Error generating sample images:', err);
    process.exit(1);
  }
}

run();
