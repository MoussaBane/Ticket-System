const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');
const Reservation = require('../models/Reservation');
const {
  sendSuccess,
  sendError,
  sendValidationError,
} = require("../utils/responseUtils");

/**
 * POST /api/manager/reservations
 * Create a single reservation (manager or admin only)
 */
router.post(
  "/reservations",
  verifyToken,
  roleAuth("manager", "admin"),
  async (req, res) => {
    try {
      const { buyerName, buyerEmail, buyerPhone, holderName, holderEmail } =
        req.body;

      // Validation
      const errors = [];
      if (!buyerName || buyerName.trim() === "")
        errors.push("Buyer name is required");
      if (!buyerEmail || buyerEmail.trim() === "")
        errors.push("Buyer email is required");
      if (!holderName || holderName.trim() === "")
        errors.push("Holder name is required");
      if (!holderEmail || holderEmail.trim() === "")
        errors.push("Holder email is required");

      if (errors.length > 0) {
        return sendValidationError(res, errors);
      }

      // Create reservation
      const reservation = new Reservation({
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.toLowerCase().trim(),
        buyerPhone: buyerPhone ? buyerPhone.trim() : null,
        holderName: holderName.trim(),
        holderEmail: holderEmail.toLowerCase().trim(),
        createdBy: req.user.id,
      });

      await reservation.save();

      return sendSuccess(
        res,
        { reservation },
        201,
        "Reservation created successfully"
      );
    } catch (err) {
      console.error("Error creating reservation:", err);
      return sendError(
        res,
        "Server error while creating reservation",
        500,
        err.message
      );
    }
  }
);

/**
 * POST /api/manager/import-reservations
 * Import multiple reservations from CSV
 * Expected format: buyerName,buyerEmail,buyerPhone,holderName,holderEmail
 */
router.post(
  "/import-reservations",
  verifyToken,
  roleAuth("manager", "admin"),
  express.text({ type: "text/*", limit: "5mb" }),
  async (req, res) => {
    try {
      const csv = req.body;

      if (!csv || csv.trim() === "") {
        return sendValidationError(res, "CSV content is required");
      }

      // Parse CSV lines
      const lines = csv
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) {
        return sendValidationError(res, "CSV file is empty");
      }

      const created = [];
      const skipped = [];

      for (let i = 0; i < lines.length; i++) {
        try {
          const parts = lines[i]
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0);

          // Expected format: buyerName,buyerEmail,buyerPhone,holderName,holderEmail
          if (parts.length < 4) {
            skipped.push({
              line: i + 1,
              reason: "Insufficient fields (minimum 4 required)",
            });
            continue;
          }

          const [buyerName, buyerEmail, buyerPhone, holderName, holderEmail] =
            parts;

          // Validate required fields
          if (!buyerName || !buyerEmail || !holderName || !holderEmail) {
            skipped.push({
              line: i + 1,
              reason: "Missing required fields",
            });
            continue;
          }

          const reservation = new Reservation({
            buyerName: buyerName.trim(),
            buyerEmail: buyerEmail.toLowerCase().trim(),
            buyerPhone: buyerPhone ? buyerPhone.trim() : null,
            holderName: holderName.trim(),
            holderEmail: holderEmail.toLowerCase().trim(),
            createdBy: req.user.id,
          });

          await reservation.save();
          created.push(reservation);
        } catch (lineErr) {
          skipped.push({
            line: i + 1,
            reason: lineErr.message,
          });
        }
      }

      return sendSuccess(
        res,
        {
          created: created.length,
          skipped: skipped.length,
          skippedDetails: skipped.length > 0 ? skipped : undefined,
        },
        200,
        `Imported ${created.length} reservations successfully`
      );
    } catch (err) {
      console.error("Error importing reservations:", err);
      return sendError(
        res,
        "Server error while importing reservations",
        500,
        err.message
      );
    }
  }
);

/**
 * GET /api/manager/reservations
 * List reservations created by current user
 */
router.get(
  "/reservations",
  verifyToken,
  roleAuth("manager", "admin"),
  async (req, res) => {
    try {
      let query = {};

      // Managers see only their own reservations, admins see all
      if (req.user.role === "manager") {
        query.createdBy = req.user.id;
      }

      const reservations = await Reservation.find(query)
        .populate("createdBy", "nom prenom email")
        .populate("ticketId", "code pdfUrl")
        .sort({ createdAt: -1 });

      return sendSuccess(res, reservations, 200, "Reservations retrieved");
    } catch (err) {
      console.error("Error fetching reservations:", err);
      return sendError(
        res,
        "Server error while fetching reservations",
        500,
        err.message
      );
    }
  }
);

module.exports = router;
