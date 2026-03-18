const { AppError } = require('../errors/AppError');

/**
 * Segregation of Duties middleware for BC (Bon de Commande) approval.
 *
 * Rule: the user approving a BC must NOT be the same user who created it.
 * This middleware expects the BC to have already been fetched and attached
 * to req.bc by the route handler before calling this middleware in the chain.
 *
 * Usage in route:
 *   router.patch('/:id/approve', auth, requireRole('SUPERADMIN', 'FINANCE_DIRECTOR'), fetchBC, sodCheck, handler)
 */
const sodCheck = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('UNAUTHORIZED', 'Utilisateur non authentifié.', 401));
  }

  if (!req.bc) {
    return next(new AppError('INTERNAL_ERROR', 'BC non chargé avant le contrôle SoD.', 500));
  }

  if (req.bc.createdBy === req.user.id) {
    return next(
      new AppError(
        'SOD_VIOLATION',
        'Violation de séparation des tâches : le créateur du BC ne peut pas l\'approuver.',
        403,
      ),
    );
  }

  next();
};

module.exports = { sodCheck };