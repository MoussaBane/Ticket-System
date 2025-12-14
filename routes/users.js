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
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return sendError(res, 'Utilisateur introuvable', 404);
    }

    return sendSuccess(res, { user }, 200, 'Profil récupéré');
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return sendError(res, 'Erreur serveur lors de la récupération du profil', 500, err.message);
  }
});

/**
 * GET /api/users/my-tickets/download/:code
 * Download an image of a ticket assigned to the current user.
 * Only accessible by manager and admin roles.
 * Query: template=vip|normal (defaults to ticketType)
 */
router.get(
  '/my-tickets/download/:code',
  verifyToken,
  roleAuth('manager', 'admin'),
  async (req, res) => {
    try {
      const { code } = req.params;
      const templateQuery = (req.query.template || '').toUpperCase();
      const userId = req.user.id;

      const ticket = await Ticket.findOne({
        code,
        isAssigned: true,
        assignedTo: { $exists: true },
      }).populate('assignedBy', 'email nom prenom');

      if (!ticket) {
        return sendError(res, 'Ticket introuvable ou non assigné', 404);
      }

      // Get current user info
      const user = await User.findById(userId).select('nom prenom email');
      if (!user) {
        return sendError(res, 'Utilisateur introuvable', 404);
      }

      // Authorization: allow if assignedBy is current user OR email matches OR name matches
      const assignedByMatch = ticket.assignedBy && ticket.assignedBy._id?.toString() === userId;
      const emailMatch =
        user.email &&
        ticket.assignedEmail &&
        user.email.toLowerCase() === ticket.assignedEmail.toLowerCase();
      const nameMatch =
        ticket.assignedTo &&
        `${user.prenom || ''} ${user.nom || ''}`.toLowerCase() === ticket.assignedTo.toLowerCase();

      if (!assignedByMatch && !emailMatch && !nameMatch) {
        return sendError(res, "Vous n'êtes pas autorisé à télécharger ce ticket", 403);
      }

      const templateType =
        templateQuery === 'VIP' || templateQuery === 'NORMAL' ? templateQuery : ticket.ticketType;

      const { filePath, publicUrl } = await generateTicketImage(ticket, templateType);

      // Mark ticket as downloaded
      await Ticket.findByIdAndUpdate(ticket._id, {
        isDownloaded: true,
        downloadedAt: new Date(),
      });

      // Stream file for download (disable caching to avoid stale images)
      const fileName = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const s = fs.createReadStream(filePath);
      s.on('error', (e) => {
        console.error('Error streaming ticket image:', e);
        return sendError(res, "Erreur lors du téléchargement de l'image du ticket", 500);
      });
      s.pipe(res);
    } catch (err) {
      console.error('Error generating ticket image:', err);
      return sendError(
        res,
        "Erreur serveur lors de la génération de l'image du ticket",
        500,
        err.message
      );
    }
  }
);

/**
 * PUT /api/users/me
 * Update current user's profile (name, email) or password
 * Only accessible by manager and admin roles.
 * Requires currentPassword to change password
 */
router.put('/me', verifyToken, roleAuth('manager', 'admin'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, prenom, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return sendError(res, 'Utilisateur introuvable', 404);
    }

    // Update profile fields
    if (nom && nom.trim() !== '') user.nom = nom.trim();
    if (prenom && prenom.trim() !== '') user.prenom = prenom.trim();
    if (email && email.trim() !== '') user.email = email.toLowerCase().trim();

    // Change password if requested
    if (newPassword) {
      if (!currentPassword) {
        return sendValidationError(
          res,
          'Le mot de passe actuel est requis pour changer le mot de passe'
        );
      }

      if (newPassword.length < 8) {
        return sendValidationError(
          res,
          'Le nouveau mot de passe doit contenir au moins 8 caractères'
        );
      }

      // Verify current password
      const passwordMatch = await user.comparePassword(currentPassword);
      if (!passwordMatch) {
        return sendError(res, 'Le mot de passe actuel est incorrect', 401);
      }

      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();

    const returnedUser = user.toObject();
    delete returnedUser.password;

    return sendSuccess(res, { user: returnedUser }, 200, 'Profil mis à jour avec succès');
  } catch (err) {
    console.error('Error updating user profile:', err);
    return sendError(res, 'Erreur serveur lors de la mise à jour du profil', 500, err.message);
  }
});

/**
 * GET /api/users
 * List all users (admin only)
 */
router.get('/', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return sendSuccess(res, users, 200, 'Utilisateurs récupérés');
  } catch (err) {
    console.error('Error fetching users:', err);
    return sendError(
      res,
      'Erreur serveur lors de la récupération des utilisateurs',
      500,
      err.message
    );
  }
});

/**
 * PUT /api/users/:id/role
 * Change a user's role (admin only)
 */
router.put('/:id/role', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || role.trim() === '') {
      return sendValidationError(res, 'Le rôle est requis');
    }

    const allowedRoles = ['admin', 'manager', 'normal'];
    if (!allowedRoles.includes(role)) {
      return sendValidationError(res, `Le rôle doit être parmi: ${allowedRoles.join(', ')}`);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 'Utilisateur introuvable', 404);
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 'Impossible de supprimer le dernier administrateur', 400);
      }
    }

    user.role = role;
    await user.save();

    const returnedUser = user.toObject();
    delete returnedUser.password;

    return sendSuccess(res, { user: returnedUser }, 200, 'Rôle utilisateur mis à jour avec succès');
  } catch (err) {
    console.error('Error updating user role:', err);
    return sendError(
      res,
      'Erreur serveur lors de la mise à jour du rôle utilisateur',
      500,
      err.message
    );
  }
});

/**
 * PUT /api/users/:id/reset-password
 * Reset a user's password (admin only)
 */
router.put('/:id/reset-password', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim() === '') {
      return sendValidationError(res, 'Le nouveau mot de passe est requis');
    }

    if (newPassword.length < 8) {
      return sendValidationError(res, 'Le mot de passe doit contenir au moins 8 caractères');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 'Utilisateur introuvable', 404);
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    return sendSuccess(res, null, 200, 'Mot de passe réinitialisé avec succès');
  } catch (err) {
    console.error('Error resetting user password:', err);
    return sendError(
      res,
      'Erreur serveur lors de la réinitialisation du mot de passe',
      500,
      err.message
    );
  }
});

/**
 * PUT /api/users/:id
 * Update user information (admin only)
 */
router.put('/:id', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 'Utilisateur introuvable', 404);
    }

    // Validation
    const errors = [];
    if (nom !== undefined && nom.trim() === '') errors.push('Le nom ne peut pas être vide');
    if (prenom !== undefined && prenom.trim() === '')
      errors.push('Le prénom ne peut pas être vide');
    if (email !== undefined) {
      if (email.trim() === '') {
        errors.push("L'email ne peut pas être vide");
      } else {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: req.params.id },
        });
        if (existingUser) {
          errors.push('Cet email est déjà utilisé');
        }
      }
    }

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Update fields if provided
    if (nom !== undefined) user.nom = nom.trim();
    if (prenom !== undefined) user.prenom = prenom.trim();
    if (email !== undefined) user.email = email.toLowerCase().trim();

    await user.save();

    return sendSuccess(
      res,
      {
        user: {
          _id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        },
      },
      200,
      'Utilisateur mis à jour avec succès'
    );
  } catch (err) {
    console.error('Error updating user:', err);
    return sendError(
      res,
      "Erreur serveur lors de la mise à jour de l'utilisateur",
      500,
      err.message
    );
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user (admin only)
 */
router.delete('/:id', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 'Utilisateur introuvable', 404);
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 'Impossible de supprimer le dernier administrateur', 400);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 200, 'Utilisateur supprimé avec succès');
  } catch (err) {
    console.error('Error deleting user:', err);
    return sendError(
      res,
      "Erreur serveur lors de la suppression de l'utilisateur",
      500,
      err.message
    );
  }
});

module.exports = router;
