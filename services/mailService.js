const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendTicketMail(ticket) {
  if (!ticket.assignedEmail || !ticket.pdfUrl) return;

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const downloadLink = `${baseUrl}${ticket.pdfUrl}`;

  const mailOptions = {
    from: `"${process.env.MAIL_NAME || 'Event Team'}" <${process.env.MAIL_USER}>`,
    to: ticket.assignedEmail,
    subject: 'Your event ticket',
    html: `
      <p>Hello ${ticket.assignedTo || ''},</p>
      <p>Here is your ticket for the event.</p>
      <p>Ticket code: <b>${ticket.code}</b></p>
      <p>You can download your ticket here:</p>
      <p><a href="${downloadLink}">Download my ticket</a></p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendTicketMail };
