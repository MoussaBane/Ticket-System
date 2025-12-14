const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const Jimp = require("jimp");

/**
 * Generate a ticket image based on template (VIP or NORMAL)
 * Overlays: Ticket number (code), QR image, code text
 * @param {Object} ticket - Ticket doc with `code`, `ticketType`, `assignedTo`
 * @param {('VIP'|'NORMAL')} templateType - Template to use
 * @returns {Promise<{ filePath: string, publicUrl: string }>} Output paths
 */
async function generateTicketImage(ticket, templateType) {
  if (!ticket || !ticket.code) {
    throw new Error('Ticket must have a 6-digit code');
  }

  const tpl = (templateType || ticket.ticketType || 'NORMAL').toUpperCase();
  if (!['VIP', 'NORMAL'].includes(tpl)) {
    throw new Error('templateType must be VIP or NORMAL');
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const templateFile = path.join(publicDir, tpl === 'VIP' ? 'vip.png' : 'normal.png');
  if (!fs.existsSync(templateFile)) {
    throw new Error(`Template image not found: ${templateFile}`);
  }

  // Output directory
  const outDir = path.join(publicDir, 'tickets', 'images');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Coordinates per template (tuned for better placement)
  // numberCenter: circular badge center for ticket code (6 digits)
  // qrTopLeft: top-left position of QR image
  // codeText: label/value position for CODE text below QR
  // ticketNoText: position for sequential ticketNo display
  // Using provided precise coordinates (same for both templates unless specified)
  // QR rectangle: P9(1118,224) to P10(1348,224) to P11(1349,453) to P12(1118,453)
  // -> top-left (1118,224), width ≈ 231, height ≈ 229; use square min dimension.
  // ticketNo segment: P13(1199,111) to P14(1271,111) -> center horizontally.
  // ticket code segment: P15(1253,538) to P16(1349,538) -> use white text.
  const qrX = 1118;
  const qrY = 224;
  const qrW = 1370 - 1118; // 252
  const qrH = 453 - 224; // 229
  const qrSizeExact = Math.min(qrW, qrH); // 229

  const ticketNoY = 111;
  const ticketNoXStart = 1199;
  const ticketNoXEnd = 1271;
  const ticketNoCenterX = Math.round((ticketNoXStart + ticketNoXEnd) / 2); // 1235

  const codeY = 520;
  const codeXStart = 1240;

  const coordsPreset = {
    VIP: {
      numberCenter: { x: ticketNoCenterX, y: ticketNoY },
      qrTopLeft: { x: qrX, y: qrY },
      qrSize: qrSizeExact,
      codeText: { x: codeXStart, y: codeY },
      ticketNoText: { x: ticketNoCenterX, y: ticketNoY },
    },
    NORMAL: {
      numberCenter: { x: ticketNoCenterX, y: ticketNoY },
      qrTopLeft: { x: qrX, y: qrY },
      qrSize: qrSizeExact,
      codeText: { x: codeXStart, y: codeY },
      ticketNoText: { x: ticketNoCenterX, y: ticketNoY },
    },
  };

  const coords = coordsPreset[tpl];

  // Load template
  const template = await Jimp.read(templateFile);

  // Generate QR as buffer and load into Jimp
  // Encode only the raw ticket code in the QR (no URL wrapper)
  const qrDataUrl = await QRCode.toDataURL(ticket.code, { margin: 0 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await Jimp.read(qrBuffer);
  qrImage.resize(coords.qrSize, coords.qrSize);

  // Composite QR onto template
  template.composite(qrImage, coords.qrTopLeft.x, coords.qrTopLeft.y);

  // Prepare fonts
  // Use Jimp built-in font; for better matching, you can replace with custom TTF rendering.
  const fontLargeBlack = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  const fontMediumBlack = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const fontSmallBlack = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  const fontBoldWhite = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const fontMediumWhite = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

  // Center ticket number inside blue circle: draw centered text at approx point
  // We'll compute width of text and adjust X to center around numberCenter.x
  const ticketNumberText = ticket.ticketNo ? `${ticket.ticketNo}` : '';
  const numberTextWidth = Jimp.measureText(fontMediumBlack, ticketNumberText);
  const numberTextHeight = Jimp.measureTextHeight(
    fontMediumBlack,
    ticketNumberText,
    numberTextWidth
  );
  const centeredX = Math.round(coords.numberCenter.x - numberTextWidth / 2);
  const adjustedY = Math.round(coords.numberCenter.y - numberTextHeight / 2);
  template.print(fontBoldWhite, centeredX, adjustedY, ticketNumberText);

  // Draw code label + value. The template may already have "CODE:" label; if not, we add it.
  template.print(fontBoldWhite, coords.codeText.x, coords.codeText.y, ticket.code);

  // Draw sequential ticket number if available (top-left area)
  // Already rendered above as centered text in numberCenter

  // Optional: add assignedTo under QR or elsewhere (not requested, so skipping)

  const outName = `ticket-${ticket.code}-${tpl.toLowerCase()}.png`;
  const outPath = path.join(outDir, outName);

  // Delete existing file to ensure fresh generation with latest positioning
  if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
  }

  await template.quality(100).writeAsync(outPath);

  const publicUrl = `/tickets/images/${outName}`;
  return { filePath: outPath, publicUrl };
}

module.exports = { generateTicketImage };
