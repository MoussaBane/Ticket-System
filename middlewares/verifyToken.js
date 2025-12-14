/**
 * JWT Token Verification Middleware
 * Extracts and validates JWT token from Authorization header
 * Attaches decoded user data to req.user
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is missing",
    });
  }

  try {
    const { jwtVerify } = require("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      console.error('JWT_SECRET not configured or too short (min 32 chars)');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    const { payload } = await jwtVerify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyToken;
