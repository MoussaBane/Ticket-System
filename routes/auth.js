const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require("express-rate-limit");

// Limiter les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: "Trop de tentatives de connexion, veuillez réessayer plus tard",
});

// Connexion avec limitation de taux
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Validation basique
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email et mot de passe requis",
    });
  }

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects",
      });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects",
      });
    }

    // 3. Générer le token JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: "admin", // Vous pouvez ajouter un système de rôles
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "3h" }
    );

    // 4. Renvoyer la réponse sans le mot de passe
    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// Inscription admin (protéger cette route en production)
router.post("/register", async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  // Validation
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Tous les champs sont requis",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Le mot de passe doit contenir au moins 8 caractères",
    });
  }

  try {
    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email déjà utilisé",
      });
    }

    // Créer le nouvel utilisateur
    const newUser = new User({
      nom,
      prenom,
      email,
      password,
      role: "guest", // Par défaut
    });

    // Sauvegarder (le pre-save hash le mot de passe)
    await newUser.save();

    // Générer le token automatiquement
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "3h" }
    );

    // Renvoyer la réponse
    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "Admin créé avec succès",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Erreur d'inscription:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

module.exports = router;