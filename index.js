/**
 * Ticket Management System - Main Server
 * Node.js + Express + MongoDB backend for event ticket management
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { Parser } = require("json2csv");
const QRCode = require("qrcode");

// Models and Routes
const Ticket = require("./models/Ticket");
const adminAuthRoutes = require("./routes/auth");
const managerRoutes = require("./routes/manager");
const adminRoutes = require("./routes/admin");
const usersRoutes = require("./routes/users");

// Middlewares
const verifyToken = require("./middlewares/verifyToken");
const roleAuth = require("./middlewares/roleAuth");
const adminAuth = require("./middlewares/adminAuth");

// Utilities
const {
  sendSuccess,
  sendError,
  sendValidationError,
} = require("./utils/responseUtils");

// Initialize Express app
const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Configure view engine for PDF templates
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// =====================
// ROUTES CONFIGURATION
// =====================

// Authentication routes (login, register)
app.use("/admin", adminAuthRoutes);

// API routes for manager and admin workflows
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", usersRoutes);

// =====================
// TICKET VALIDATION ENDPOINTS
// =====================

/**
 * POST /validate-ticket
 * Validate a ticket via QR code scan (admin/manager only)
 */
app.post(
  "/validate-ticket",
  verifyToken,
  roleAuth("admin", "manager"),
  async (req, res) => {
    const { code } = req.body;

    if (!code || code.trim() === "") {
      return sendValidationError(res, "Ticket code is required");
    }

    try {
      const ticket = await Ticket.findOne({ code });

      if (!ticket) {
        return sendError(res, "Ticket not found", 404);
      }

      if (ticket.isUsed) {
        return sendSuccess(
          res,
          { usedAt: ticket.usedAt },
          200,
          `Ticket already used on ${ticket.usedAt.toLocaleString()}`
        );
      }

      // Mark ticket as used
      ticket.isUsed = true;
      ticket.usedAt = new Date();
      await ticket.save();

      return sendSuccess(
        res,
        { ticket: ticket.toObject() },
        200,
        "Ticket validated successfully"
      );
    } catch (err) {
      console.error("Error validating ticket:", err);
      return sendError(
        res,
        "Server error while validating ticket",
        500,
        err.message
      );
    }
  }
);

/**
 * GET /validate
 * Validate a ticket via URL query parameter
 */
app.get(
  "/validate",
  verifyToken,
  roleAuth("admin", "manager"),
  async (req, res) => {
    const { code } = req.query;

    if (!code || code.trim() === "") {
      return sendValidationError(res, "Ticket code is required");
    }

    try {
      const ticket = await Ticket.findOne({ code });

      if (!ticket) {
        return sendError(res, "Ticket not found", 404);
      }

      if (ticket.isUsed) {
        return sendSuccess(
          res,
          { usedAt: ticket.usedAt },
          200,
          `Ticket already used on ${ticket.usedAt.toLocaleString()}`
        );
      }

      // Mark ticket as used
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticket._id,
        { isUsed: true, usedAt: new Date() },
        { new: true }
      );

      return sendSuccess(
        res,
        { ticket: updatedTicket.toObject() },
        200,
        "Ticket validated successfully"
      );
    } catch (err) {
      console.error("Error validating ticket:", err);
      return sendError(
        res,
        "Server error while validating ticket",
        500,
        err.message
      );
    }
  }
);

// =====================
// TICKET MANAGEMENT ENDPOINTS
// =====================

/**
 * GET /admin/tickets
 * List all tickets with optional filtering
 */
app.get("/admin/tickets", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Apply status filters
    if (status === "used") {
      query.isUsed = true;
    } else if (status === "unused") {
      query.isUsed = false;
    } else if (status === "assigned") {
      query.isAssigned = true;
    } else if (status === "unassigned") {
      query.isAssigned = false;
    }

    const tickets = await Ticket.find(query)
      .populate("assignedBy", "nom prenom email")
      .sort({ createdAt: -1 })
      .limit(1000); // Limit to prevent huge responses

    // Generate QR codes for each ticket
    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const qrDataUrl = await QRCode.toDataURL(ticket.code);
          return {
            ...ticket.toObject(),
            qrUrl: qrDataUrl,
          };
        } catch (qrErr) {
          console.error(`Error generating QR for ticket ${ticket._id}:`, qrErr);
          return ticket.toObject();
        }
      })
    );

    return sendSuccess(
      res,
      ticketsWithQR,
      200,
      "Tickets retrieved successfully"
    );
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return sendError(
      res,
      "Server error while fetching tickets",
      500,
      err.message
    );
  }
});

/**
 * GET /admin/tickets/stats/summary
 * Get ticket statistics including VIP/NORMAL breakdown
 */
app.get(
  "/admin/tickets/stats/summary",
  verifyToken,
  roleAuth("admin", "manager"),
  async (req, res) => {
    try {
      const total = await Ticket.countDocuments();
      const assigned = await Ticket.countDocuments({ isAssigned: true });
      const used = await Ticket.countDocuments({ isUsed: true });
      const vipTotal = await Ticket.countDocuments({ ticketType: "VIP" });
      const normalTotal = await Ticket.countDocuments({ ticketType: "NORMAL" });
      const vipUsed = await Ticket.countDocuments({
        ticketType: "VIP",
        isUsed: true,
      });
      const normalUsed = await Ticket.countDocuments({
        ticketType: "NORMAL",
        isUsed: true,
      });

      return sendSuccess(
        res,
        {
          total,
          assigned,
          available: total - assigned,
          used,
          vip: {
            total: vipTotal,
            limit: 90,
            remaining: 90 - vipTotal,
            used: vipUsed,
          },
          normal: {
            total: normalTotal,
            limit: 410,
            remaining: 410 - normalTotal,
            used: normalUsed,
          },
        },
        200,
        "Statistics retrieved successfully"
      );
    } catch (err) {
      console.error("Error fetching stats:", err);
      return sendError(
        res,
        "Server error while fetching statistics",
        500,
        err.message
      );
    }
  }
);

/**
 * GET /admin/tickets/:id
 * Get a specific ticket by ID
 */
app.get("/admin/tickets/:id", adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return sendError(res, "Ticket not found", 404);
    }

    const qrUrl = await QRCode.toDataURL(ticket.code);

    return sendSuccess(
      res,
      { ...ticket.toObject(), qrUrl },
      200,
      "Ticket retrieved"
    );
  } catch (err) {
    console.error("Error fetching ticket:", err);
    return sendError(
      res,
      "Server error while fetching ticket",
      500,
      err.message
    );
  }
});

/**
 * PUT /admin/tickets/:id
 * Update a ticket's properties
 */
app.put("/admin/tickets/:id", adminAuth, async (req, res) => {
  try {
    const { isUsed, isAssigned, assignedTo } = req.body;
    const update = {};

    // Update isUsed status
    if (isUsed !== undefined) {
      update.isUsed = isUsed;
      if (isUsed) {
        update.usedAt = new Date();
      } else {
        update.usedAt = null;
      }
    }

    // Update assignment status
    if (isAssigned !== undefined) {
      if (isAssigned && assignedTo && assignedTo.trim() !== "") {
        update.isAssigned = true;
        update.assignedTo = assignedTo.trim();
        update.assignedAt = update.assignedAt || new Date();
      } else {
        update.isAssigned = false;
        update.assignedTo = null;
        update.assignedAt = null;
      }
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!ticket) {
      return sendError(res, "Ticket not found", 404);
    }

    return sendSuccess(
      res,
      ticket.toObject(),
      200,
      "Ticket updated successfully"
    );
  } catch (err) {
    console.error("Error updating ticket:", err);
    return sendError(
      res,
      "Server error while updating ticket",
      500,
      err.message
    );
  }
});

/**
 * PUT /admin/tickets/:id/assign
 * Assign a ticket to the logged-in user with type (VIP/NORMAL)
 */
app.put(
  "/admin/tickets/:id/assign",
  verifyToken,
  roleAuth("admin", "manager"),
  async (req, res) => {
    try {
      const { ticketType } = req.body;

      if (!ticketType || !["VIP", "NORMAL"].includes(ticketType)) {
        return sendValidationError(
          res,
          "Ticket type is required (VIP or NORMAL)"
        );
      }

      // Get user info from token
      const userId = req.user.id;
      const userName =
        req.user.nom && req.user.prenom
          ? `${req.user.prenom} ${req.user.nom}`
          : req.user.email;

      const ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        {
          isAssigned: true,
          assignedTo: userName,
          assignedBy: userId,
          assignedAt: new Date(),
          ticketType: ticketType,
        },
        { new: true }
      );

      if (!ticket) {
        return sendError(res, "Ticket not found", 404);
      }

      return sendSuccess(
        res,
        ticket.toObject(),
        200,
        `Ticket ${ticketType} assigned successfully`
      );
    } catch (err) {
      console.error("Error assigning ticket:", err);
      return sendError(
        res,
        "Server error while assigning ticket",
        500,
        err.message
      );
    }
  }
);

/**
 * PUT /admin/tickets/:id/validate
 * Mark a ticket as used/validated
 */
app.put("/admin/tickets/:id/validate", adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        isUsed: true,
        usedAt: new Date(),
      },
      { new: true }
    );

    if (!ticket) {
      return sendError(res, "Ticket not found", 404);
    }

    return sendSuccess(
      res,
      ticket.toObject(),
      200,
      "Ticket validated successfully"
    );
  } catch (err) {
    console.error("Error validating ticket:", err);
    return sendError(
      res,
      "Server error while validating ticket",
      500,
      err.message
    );
  }
});

/**
 * POST /admin/tickets/assign-bulk
 * Assign multiple tickets at once to the logged-in user
 */
app.post(
  "/admin/tickets/assign-bulk",
  verifyToken,
  roleAuth("admin", "manager"),
  async (req, res) => {
    try {
      const { count, ticketType } = req.body;

      if (!count || count < 1 || count > 100) {
        return sendValidationError(res, "Count must be between 1 and 100");
      }

      if (!ticketType || !["VIP", "NORMAL"].includes(ticketType)) {
        return sendValidationError(
          res,
          "Ticket type is required (VIP or NORMAL)"
        );
      }

      // Check limits
      const vipCount = await Ticket.countDocuments({ ticketType: "VIP" });
      const normalCount = await Ticket.countDocuments({ ticketType: "NORMAL" });

      if (ticketType === "VIP" && vipCount + count > 90) {
        return sendError(
          res,
          `Cannot assign ${count} VIP tickets. Limit: 90 (${vipCount} already assigned)`,
          400
        );
      }

      if (ticketType === "NORMAL" && normalCount + count > 410) {
        return sendError(
          res,
          `Cannot assign ${count} NORMAL tickets. Limit: 410 (${normalCount} already assigned)`,
          400
        );
      }

      // Get user info from token
      const userId = req.user.id;
      const userName =
        req.user.nom && req.user.prenom
          ? `${req.user.prenom} ${req.user.nom}`
          : req.user.email;

      // Find unassigned tickets
      const unassignedTickets = await Ticket.find({ isAssigned: false }).limit(
        count
      );

      if (unassignedTickets.length < count) {
        return sendError(
          res,
          `Only ${unassignedTickets.length} unassigned tickets available`,
          400
        );
      }

      // Update tickets
      const ticketIds = unassignedTickets.map((t) => t._id);
      const result = await Ticket.updateMany(
        { _id: { $in: ticketIds } },
        {
          isAssigned: true,
          assignedTo: userName,
          assignedBy: userId,
          assignedAt: new Date(),
          ticketType: ticketType,
        }
      );

      return sendSuccess(
        res,
        {
          assigned: result.modifiedCount,
          ticketType,
          assignedTo: userName,
        },
        200,
        `${result.modifiedCount} tickets ${ticketType} assigned successfully`
      );
    } catch (err) {
      console.error("Error assigning tickets:", err);
      return sendError(
        res,
        "Server error while assigning tickets",
        500,
        err.message
      );
    }
  }
);

/**
 * DELETE /tickets/:id
 * Delete a single ticket
 */
app.delete("/tickets/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return sendError(res, "Ticket not found", 404);
    }

    return sendSuccess(res, null, 200, "Ticket deleted successfully");
  } catch (err) {
    console.error("Error deleting ticket:", err);
    return sendError(
      res,
      "Server error while deleting ticket",
      500,
      err.message
    );
  }
});

/**
 * POST /delete-all-tickets
 * Delete all tickets (use with caution!)
 */
app.post("/delete-all-tickets", adminAuth, async (req, res) => {
  try {
    const result = await Ticket.deleteMany({});

    return sendSuccess(
      res,
      { deletedCount: result.deletedCount },
      200,
      `${result.deletedCount} tickets deleted`
    );
  } catch (err) {
    console.error("Error deleting all tickets:", err);
    return sendError(
      res,
      "Server error while deleting tickets",
      500,
      err.message
    );
  }
});

/**
 * POST /generate-tickets
 * Generate bulk tickets (200 by default)
 */
app.post("/generate-tickets", adminAuth, async (req, res) => {
  try {
    const { count = 200 } = req.body;

    if (count < 1 || count > 1000) {
      return sendValidationError(
        res,
        "Ticket count must be between 1 and 1000"
      );
    }

    const tickets = Array.from({ length: count }, () => ({
      code: Math.floor(100000 + Math.random() * 900000).toString(),
    }));

    const result = await Ticket.insertMany(tickets);

    return sendSuccess(
      res,
      { count: result.length },
      201,
      `Generated ${result.length} tickets successfully`
    );
  } catch (err) {
    console.error("Error generating tickets:", err);
    return sendError(
      res,
      "Server error while generating tickets",
      500,
      err.message
    );
  }
});

/**
 * GET /admin/export-csv
 * Export all tickets as CSV
 */
app.get("/admin/export-csv", adminAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find().populate(
      "assignedBy",
      "nom prenom email"
    );

    // Transform data for CSV
    const ticketsForCSV = tickets.map((ticket) => ({
      _id: ticket._id,
      code: ticket.code,
      ticketType: ticket.ticketType || "NORMAL",
      isAssigned: ticket.isAssigned,
      assignedTo: ticket.assignedTo || "",
      assignedBy: ticket.assignedBy
        ? ticket.assignedBy.prenom
          ? `${ticket.assignedBy.prenom} ${ticket.assignedBy.nom}`
          : ticket.assignedBy.email
        : "",
      assignedAt: ticket.assignedAt || "",
      isUsed: ticket.isUsed,
      usedAt: ticket.usedAt || "",
      createdAt: ticket.createdAt,
    }));

    const fields = [
      "_id",
      "code",
      "ticketType",
      "isAssigned",
      "assignedTo",
      "assignedBy",
      "assignedAt",
      "isUsed",
      "usedAt",
      "createdAt",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(ticketsForCSV);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("tickets.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    return sendError(
      res,
      "Server error while exporting data",
      500,
      err.message
    );
  }
});

// =====================
// HEALTH CHECK ENDPOINT
// =====================

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// ERROR HANDLING
// =====================

/**
 * 404 - Route not found
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
});

// =====================
// DATABASE & SERVER STARTUP
// =====================

const connectDatabase = async () => {
  const mongoUri =
    process.env.DB_URI ||
    process.env.DB_URL ||
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pznxahw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const startServer = async () => {
  const PORT = process.env.PORT || 3000;

  // Connect to database
  await connectDatabase();

  // Start listening
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.disconnect();
  process.exit(0);
});

// Start server
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
