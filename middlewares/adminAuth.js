/**
 * Admin-only Authorization Middleware
 * Verifies JWT token and ensures user has 'admin' role
 * This is a shortcut for verifyToken + roleAuth('admin')
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing",
      });
    }

    const { jwtVerify } = require("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    if (!secret || process.env.JWT_SECRET.length === 0) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const { payload: decoded } = await jwtVerify(token, secret);

    // Verify user is authenticated
    if (!decoded || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Invalid token payload.",
      });
    }

    // Verify user is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    // Attach user data to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired token.",
    });
  }
};
