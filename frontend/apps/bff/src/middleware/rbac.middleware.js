const { AppError } = require('../errors/AppError');

/**
 * Factory that returns an Express middleware enforcing role-based access.
 *
 * Usage:
 *   router.get('/', requireRole('OMS_OPERATOR', 'SUPERADMIN'), handler)
 *   router.post('/', requireRole('PRODUCT_MANAGER', 'SUPERADMIN'), handler)
 */
const requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Utilisateur non authentifié.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'FORBIDDEN',
          `Accès refusé. Rôles autorisés : ${allowedRoles.join(', ')}.`,
          403,
        ),
      );
    }

    next();
  };
};

module.exports = { requireRole };