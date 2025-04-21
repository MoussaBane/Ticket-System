const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Connexion
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Email invalide" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
      }
  
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );
  
      res.json({
        token,
        user: {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
});
  

// Inscription admin (à utiliser une seule fois pour créer le premier admin)
router.post("/register", async (req, res) => {
    const { nom, prenom, email, password } = req.body;
  
    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        nom,
        prenom,
        email,
        password: hashedPassword,
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "Admin créé avec succès ✅" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
