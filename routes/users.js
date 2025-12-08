const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleAuth = require('../middlewares/roleAuth');
const User = require('../models/User');

// Get own profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update own profile (name, email) and change password (requires currentPassword)
router.put('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, prenom, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (email) user.email = email;

    // If changing password, require currentPassword
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required to change password' });
      const match = await user.comparePassword(currentPassword);
      if (!match) return res.status(401).json({ message: 'Current password incorrect' });
      user.password = newPassword; // will be hashed by pre-save
    }

    await user.save();

    const returned = user.toObject();
    delete returned.password;
    res.json({ success: true, user: returned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only: list all users
router.get('/', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only: change a user's role
router.put('/:id/role', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    // Only allow valid roles
    const allowed = ['admin', 'manager', 'normal'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    const returned = user.toObject();
    delete returned.password;
    res.json({ success: true, user: returned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only: reset a user's password
router.put('/:id/reset-password', verifyToken, roleAuth('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: 'New password is required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword; // will be hashed by pre-save
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
