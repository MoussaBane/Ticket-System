/**
 * Role-based authorization middleware
 * MUST be used AFTER verifyToken middleware to access req.user
 * @param {...string} allowedRoles - One or more role names (e.g., 'admin', 'manager')
 * @returns {Function} Express middleware function
 */
module.exports = function roleAuth(...allowedRoles) {
  return function (req, res, next) {
    // Ensure token has been verified and user is attached to request
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Token missing or invalid.",
      });
    }

    const userRole = req.user.role;

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
