const { createRemoteJWKSet, jwtVerify } = require('jose');
const env = require('../config/env');
const { AppError } = require('../errors/AppError');

const MOCK_USER = {
  id: env.mock.userId,
  role: env.mock.role,
  nameFr: env.mock.nameFr,
  nameAr: env.mock.nameAr,
};

let jwks = null;

const getJWKS = () => {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(env.keycloak.jwksUri));
  }
  return jwks;
};

/**
 * Validates the Bearer JWT from Keycloak and attaches req.user.
 * In mock mode (USE_MOCK=true), injects the MOCK_USER from env instead.
 *
 * req.user shape:
 *   { id, role, nameFr, nameAr }
 */
const auth = async (req, _res, next) => {
  try {
    if (env.useMock) {
      req.user = MOCK_USER;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'Token manquant.', 401);
    }

    const token = authHeader.slice(7);
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: env.keycloak.issuer,
      audience: env.keycloak.clientId,
    });

    // Keycloak puts realm roles under realm_access.roles
    const realmRoles = payload.realm_access?.roles ?? [];
    const ferzaRoles = [
      'SUPERADMIN', 'FINANCE_DIRECTOR', 'PRODUCT_MANAGER',
      'INVENTORY_MANAGER', 'OMS_OPERATOR', 'CRM_AGENT',
      'PROCUREMENT_MANAGER', 'CATALOGUE_MANAGER', 'ANALYST',
    ];
    const role = realmRoles.find((r) => ferzaRoles.includes(r));
    if (!role) {
      throw new AppError('FORBIDDEN', 'Rôle FERZA non attribué.', 403);
    }

    req.user = {
      id: payload.sub,
      role,
      nameFr: payload.name ?? '',
      nameAr: payload.name_ar ?? '',
    };

    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('UNAUTHORIZED', 'Token invalide.', 401));
  }
};

module.exports = auth;