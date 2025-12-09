/**
 * Mail Service
 * Handles sending ticket emails to users
 */

const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send ticket email to user
 * @param {Object} ticket - Ticket document with pdfUrl and assignedEmail
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails
 */
async function sendTicketMail(ticket) {
  // Validate required fields
  if (!ticket.assignedEmail) {
    throw new Error("Ticket must have assignedEmail");
  }

  if (!ticket.pdfUrl) {
    throw new Error("Ticket must have pdfUrl");
  }

  // Validate SMTP credentials
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error(
      "MAIL_USER and MAIL_PASS environment variables are not configured"
    );
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const downloadLink = `${baseUrl}${ticket.pdfUrl}`;

  const mailOptions = {
    from: `"${process.env.MAIL_NAME || "Event Team"}" <${
      process.env.MAIL_USER
    }>`,
    to: ticket.assignedEmail,
    subject: "Your Event Ticket",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Event Ticket</h1>
        <p>Hello <strong>${ticket.assignedTo || "Guest"}</strong>,</p>
        <p>We're excited to have you at our event! Please find your ticket below.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p><strong>Ticket Code:</strong> <code style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 4px;">${
            ticket.code
          }</code></p>
          <p><strong>Name:</strong> ${ticket.assignedTo || "Guest"}</p>
        </div>
        
        <p style="margin: 20px 0;">
          <a href="${downloadLink}" style="display: inline-block; background-color: #6f42c1; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
            Download My Ticket
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          This is an automated email. Please do not reply directly to this message.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Ticket email sent to ${ticket.assignedEmail}`);
  } catch (err) {
    console.error(
      `Failed to send ticket email to ${ticket.assignedEmail}:`,
      err
    );
    throw new Error(`Email sending failed: ${err.message}`);
  }
}

module.exports = { sendTicketMail };
