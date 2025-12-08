const verifyToken = require('./verifyToken');

module.exports = function roleAuth(...allowedRoles) {
  return function (req, res, next) {
    // ensure token has been verified
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
