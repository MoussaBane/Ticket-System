const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Connexion
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // 3. Générer le token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    // 4. Renvoyer la réponse
    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Inscription admin (à utiliser une seule fois pour créer le premier admin)
router.post("/register", async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  try {
    // 1. Vérifier si l'email existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // 2. Créer le nouvel utilisateur (le hachage est géré par le pre-save)
    const newUser = new User({
      nom,
      prenom,
      email,
      password, // Le mot de passe sera haché automatiquement par le pre-save
    });

    // 3. Sauvegarder l'utilisateur
    await newUser.save();

    // 4. Renvoyer la réponse (sans le mot de passe)
    res.status(201).json({
      message: "Admin créé avec succès ✅",
      user: {
        id: newUser._id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Erreur d'inscription:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
