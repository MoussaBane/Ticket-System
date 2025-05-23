// middlewares/adminAuth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userData = decoded;

    // Check if user is authenticated (token valid) and has admin role
    if (!decoded || !decoded.role) {
      return res.status(401).json({ message: "Authentification échouée" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Accès refusé : réservée aux administrateurs.",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentification échouée",
    });
  }
};