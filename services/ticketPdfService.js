/**
 * Ticket PDF Generation Service
 * Generates PDF tickets with QR codes using Puppeteer
 */

const QRCode = require("qrcode");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

/**
 * Generate a PDF ticket with QR code
 * @param {Object} ticket - Ticket document with code and assignedTo
 * @returns {Promise<Object>} Object with publicUrl and qrData
 * @throws {Error} If PDF generation fails
 */
async function generateTicketPdf(ticket) {
  if (!ticket.code) {
    throw new Error("Ticket must have a code");
  }

  try {
    // Generate QR code that encodes only the ticket code (no URL)
    const qrData = await QRCode.toDataURL(ticket.code);

    // Render EJS template with ticket data
    const templatePath = path.join(__dirname, '..', 'views', 'ticket.ejs');

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Ticket template not found at ${templatePath}`);
    }

    const html = await ejs.renderFile(templatePath, {
      code: ticket.code,
      assignedTo: ticket.assignedTo || 'GUEST',
      qrData,
      backgroundUrl: process.env.TICKET_BACKGROUND_URL || '/background.png',
    });

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // For server environments
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF with A6 format (small ticket size)
    const pdfBuffer = await page.pdf({
      format: 'A6',
      printBackground: true,
      margin: {
        top: '0.25in',
        right: '0.25in',
        bottom: '0.25in',
        left: '0.25in',
      },
    });

    await browser.close();

    // Save PDF to public folder
    const ticketsDir = path.join(__dirname, '..', 'public', 'tickets');

    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }

    const fileName = `ticket-${ticket.code}.pdf`;
    const filePath = path.join(ticketsDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    const publicUrl = `/tickets/${fileName}`;

    console.log(`PDF generated successfully: ${fileName}`);

    return { publicUrl, qrData };
  } catch (err) {
    console.error("Error generating ticket PDF:", err);
    throw new Error(`PDF generation failed: ${err.message}`);
  }
}

module.exports = { generateTicketPdf };
