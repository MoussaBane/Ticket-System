const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');
const User = require('../models/User');
const Ticket = require("../models/Ticket");
const { generateTicketImage } = require("../services/ticketImageService");
const path = require("path");
const fs = require("fs");
const {
  sendSuccess,
  sendError,
  sendValidationError,
} = require("../utils/responseUtils");

/**
 * GET /api/users/me
 * Get current user's profile
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { user }, 200, "Profile retrieved");
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return sendError(
      res,
      "Server error while fetching profile",
      500,
      err.message
    );
  }
});

/**
 * GET /api/users/my-tickets/download/:code
 * Download an image of a ticket assigned to the current user.
 * Query: template=vip|normal (defaults to ticketType)
 */
router.get("/my-tickets/download/:code", verifyToken, async (req, res) => {
  try {
    const { code } = req.params;
    const templateQuery = (req.query.template || "").toUpperCase();
    const userId = req.user.id;

    const ticket = await Ticket.findOne({
      code,
      isAssigned: true,
      assignedTo: { $exists: true },
    }).populate("assignedBy", "email nom prenom");

    if (!ticket) {
      return sendError(res, "Ticket not found or not assigned", 404);
    }

    // Get current user info
    const user = await User.findById(userId).select("nom prenom email");
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Log for debugging
    console.log("Download attempt:", {
      ticketCode: ticket.code,
      userId: userId,
      ticketAssignedBy: ticket.assignedBy?._id?.toString(),
      ticketAssignedEmail: ticket.assignedEmail,
      userEmail: user.email,
      ticketAssignedTo: ticket.assignedTo,
    });

    // Authorization: allow if assignedBy is current user OR email matches OR name matches
    const assignedByMatch =
      ticket.assignedBy && ticket.assignedBy._id?.toString() === userId;
    const emailMatch =
      user.email &&
      ticket.assignedEmail &&
      user.email.toLowerCase() === ticket.assignedEmail.toLowerCase();
    const nameMatch =
      ticket.assignedTo &&
      `${user.prenom || ""} ${user.nom || ""}`.toLowerCase() ===
        ticket.assignedTo.toLowerCase();

    if (!assignedByMatch && !emailMatch && !nameMatch) {
      console.warn("Authorization failed for ticket download", {
        assignedByMatch,
        emailMatch,
        nameMatch,
      });
      return sendError(
        res,
        "You are not authorized to download this ticket",
        403
      );
    }

    const templateType =
      templateQuery === "VIP" || templateQuery === "NORMAL"
        ? templateQuery
        : ticket.ticketType;

    const { filePath, publicUrl } = await generateTicketImage(
      ticket,
      templateType
    );

    // Mark ticket as downloaded
    await Ticket.findByIdAndUpdate(ticket._id, {
      isDownloaded: true,
      downloadedAt: new Date(),
    });

    // Stream file for download
    const fileName = path.basename(filePath);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "image/png");
    const s = fs.createReadStream(filePath);
    s.on("error", (e) => {
      console.error("Error streaming ticket image:", e);
      return sendError(res, "Error downloading ticket image", 500);
    });
    s.pipe(res);
  } catch (err) {
    console.error("Error generating ticket image:", err);
    return sendError(
      res,
      "Server error while generating ticket image",
      500,
      err.message
    );
  }
});

/**
 * PUT /api/users/me
 * Update current user's profile (name, email) or password
 * Requires currentPassword to change password
 */
router.put("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, prenom, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Update profile fields
    if (nom && nom.trim() !== "") user.nom = nom.trim();
    if (prenom && prenom.trim() !== "") user.prenom = prenom.trim();
    if (email && email.trim() !== "") user.email = email.toLowerCase().trim();

    // Change password if requested
    if (newPassword) {
      if (!currentPassword) {
        return sendValidationError(
          res,
          "Current password is required to change password"
        );
      }

      if (newPassword.length < 8) {
        return sendValidationError(
          res,
          "New password must be at least 8 characters"
        );
      }

      // Verify current password
      const passwordMatch = await user.comparePassword(currentPassword);
      if (!passwordMatch) {
        return sendError(res, "Current password is incorrect", 401);
      }

      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();

    const returnedUser = user.toObject();
    delete returnedUser.password;

    return sendSuccess(
      res,
      { user: returnedUser },
      200,
      "Profile updated successfully"
    );
  } catch (err) {
    console.error("Error updating user profile:", err);
    return sendError(
      res,
      "Server error while updating profile",
      500,
      err.message
    );
  }
});

/**
 * GET /api/users
 * List all users (admin only)
 */
router.get("/", verifyToken, roleAuth("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return sendSuccess(res, users, 200, "Users retrieved");
  } catch (err) {
    console.error("Error fetching users:", err);
    return sendError(
      res,
      "Server error while fetching users",
      500,
      err.message
    );
  }
});

/**
 * PUT /api/users/:id/role
 * Change a user's role (admin only)
 */
router.put("/:id/role", verifyToken, roleAuth("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || role.trim() === "") {
      return sendValidationError(res, "Role is required");
    }

    const allowedRoles = ["admin", "manager", "normal"];
    if (!allowedRoles.includes(role)) {
      return sendValidationError(
        res,
        `Role must be one of: ${allowedRoles.join(", ")}`
      );
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Prevent removing the last admin
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return sendError(res, "Cannot remove the last admin user", 400);
      }
    }

    user.role = role;
    await user.save();

    const returnedUser = user.toObject();
    delete returnedUser.password;

    return sendSuccess(
      res,
      { user: returnedUser },
      200,
      "User role updated successfully"
    );
  } catch (err) {
    console.error("Error updating user role:", err);
    return sendError(
      res,
      "Server error while updating user role",
      500,
      err.message
    );
  }
});

/**
 * PUT /api/users/:id/reset-password
 * Reset a user's password (admin only)
 */
router.put(
  "/:id/reset-password",
  verifyToken,
  roleAuth("admin"),
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.trim() === "") {
        return sendValidationError(res, "New password is required");
      }

      if (newPassword.length < 8) {
        return sendValidationError(
          res,
          "Password must be at least 8 characters"
        );
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return sendError(res, "User not found", 404);
      }

      user.password = newPassword; // Will be hashed by pre-save hook
      await user.save();

      return sendSuccess(res, null, 200, "Password reset successfully");
    } catch (err) {
      console.error("Error resetting user password:", err);
      return sendError(
        res,
        "Server error while resetting password",
        500,
        err.message
      );
    }
  }
);

/**
 * DELETE /api/users/:id
 * Delete a user (admin only)
 */
router.delete("/:id", verifyToken, roleAuth("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return sendError(res, "Cannot delete the last admin user", 400);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 200, "User deleted successfully");
  } catch (err) {
    console.error("Error deleting user:", err);
    return sendError(res, "Server error while deleting user", 500, err.message);
  }
});

module.exports = router;
