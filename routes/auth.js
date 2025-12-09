const express = require('express');
const router = express.Router();
const User = require("../models/User");
const rateLimit = require("express-rate-limit");
const { generateToken } = require("../utils/jwtUtils");
const {
  sendSuccess,
  sendError,
  sendValidationError,
} = require("../utils/responseUtils");

/**
 * Rate limiter for login attempts
 * Prevents brute force attacks
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts max per IP
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /admin/login
 * Authenticate user and return JWT token
 */
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return sendValidationError(res, [
      "Email is required",
      "Password is required",
    ]);
  }

  try {
    // Find user by email (include password field)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password", 401);
    }

    // Generate JWT token
    const token = await generateToken(user);

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    return sendSuccess(res, { token, user: userData }, 200, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    return sendError(res, "Server error during login", 500, err.message);
  }
});

/**
 * POST /admin/register
 * Create a new user account
 * Note: In production, restrict this endpoint to admin-only
 */
router.post("/register", async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  // Validation
  const errors = [];
  if (!nom || nom.trim() === "") errors.push("First name (nom) is required");
  if (!prenom || prenom.trim() === "")
    errors.push("Last name (prenom) is required");
  if (!email || email.trim() === "") errors.push("Email is required");
  if (!password) errors.push("Password is required");
  else if (password.length < 8)
    errors.push("Password must be at least 8 characters");

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email is already registered", 400);
    }

    // Create new user
    const newUser = new User({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: req.body.role || "normal", // Defaults to 'normal'
    });

    // Save user (triggers password hashing via pre-save hook)
    await newUser.save();

    // Generate JWT token
    const token = await generateToken(newUser);

    // Return user data without password
    const userData = newUser.toObject();
    delete userData.password;

    return sendSuccess(
      res,
      { token, user: userData },
      201,
      "User registered successfully"
    );
  } catch (err) {
    console.error("Registration error:", err);
    return sendError(res, "Server error during registration", 500, err.message);
  }
});

module.exports = router;