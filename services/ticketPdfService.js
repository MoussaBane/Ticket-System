const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// Use a small inline SVG as a safe default background to avoid missing static files
const BACKGROUND_URL = 'data:image/svg+xml;base64,' + Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300">
  <rect width="100%" height="100%" fill="#f8f9fa" />
  <text x="20" y="40" font-size="20" fill="#333">Ticket</text>
</svg>
`).toString('base64');

async function generateTicketPdf(ticket) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const validationUrl = `${baseUrl}/validate?code=${ticket.code}`;
  const qrData = await QRCode.toDataURL(validationUrl);

  const templatePath = path.join(__dirname, '..', 'views', 'ticket.ejs');

  const html = await ejs.renderFile(templatePath, {
    code: ticket.code,
    assignedTo: ticket.assignedTo,
    qrData,
    backgroundUrl: BACKGROUND_URL
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({ format: 'A6', printBackground: true });
  await browser.close();

  const ticketsDir = path.join(__dirname, '..', 'public', 'tickets');
  if (!fs.existsSync(ticketsDir)) fs.mkdirSync(ticketsDir, { recursive: true });

  const fileName = `ticket-${ticket.code}.pdf`;
  const filePath = path.join(ticketsDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  const publicUrl = `/tickets/${fileName}`;

  return { publicUrl, qrData };
}

module.exports = { generateTicketPdf };
