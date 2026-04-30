const env = require('../config/env');
const { AppError } = require('../errors/AppError');
const { buildUserFromPayload, verifyIncomingToken } = require('../lib/auth');

const MOCK_USER = {
  id: env.mock.userId,
  role: env.mock.role,
  rawRole: env.mock.role,
  email: '',
  nameFr: env.mock.nameFr,
  nameAr: env.mock.nameAr,
};

/**
 * Validates the Bearer JWT from engine-b and attaches req.user.
 * When auth mocking is enabled, a missing token falls back to the configured mock user.
 *
 * req.user shape:
 *   { id, role, rawRole, email, nameFr, nameAr }
 */
const auth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      if (env.authUseMock) {
        req.user = MOCK_USER;
        return next();
      }

      throw new AppError('UNAUTHORIZED', 'Token manquant.', 401);
    }

    const token = authHeader.slice(7);
    const payload = await verifyIncomingToken(token);
    const user = buildUserFromPayload(payload);

    if (!user.role) {
      throw new AppError(
        'FORBIDDEN',
        "Aucun role ERP compatible n'est attribue a ce compte.",
        403,
      );
    }

    req.user = user;

    next();
  } catch (err) {
    next(
      err instanceof AppError
        ? err
        : new AppError('UNAUTHORIZED', 'Token invalide.', 401),
    );
  }
};

module.exports = auth;
