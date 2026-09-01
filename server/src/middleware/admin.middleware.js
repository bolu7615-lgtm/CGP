const { authenticate } = require('./auth.middleware');

/**
 * Check if user is admin or super admin
 */
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
    });
  }

  next();
}

/**
 * Check if user is super admin only
 */
function isSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required.',
    });
  }

  next();
}

/**
 * Combined middleware: authenticate + admin check
 */
const requireAdmin = [authenticate, isAdmin];
const requireSuperAdmin = [authenticate, isSuperAdmin];

module.exports = {
  isAdmin,
  isSuperAdmin,
  requireAdmin,
  requireSuperAdmin,
};