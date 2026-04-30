const { SignJWT, createRemoteJWKSet, jwtVerify } = require('jose');
const env = require('../config/env');

const ENGINE_B_ROLE_ALIASES = {
  SUPER_ADMIN: 'SUPERADMIN',
  SUPERADMIN: 'SUPERADMIN',
  PRODUCT_MANAGER: 'PRODUCT_MANAGER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  FINANCE_MANAGER: 'FINANCE_DIRECTOR',
  FINANCE_DIRECTOR: 'FINANCE_DIRECTOR',
  PROCUREMENT_MANAGER: 'PROCUREMENT_MANAGER',
  CRM_AGENT: 'CRM_AGENT',
  CRM_MANAGER: 'CRM_AGENT',
  LOGISTICS_AGENT: 'OMS_OPERATOR',
  OMS_OPERATOR: 'OMS_OPERATOR',
  REPORTING_ANALYST: 'ANALYST',
  ANALYST: 'ANALYST',
  WAREHOUSE_OPERATOR: 'INVENTORY_MANAGER',
  CATALOGUE_MANAGER: 'CATALOGUE_MANAGER',
};

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

let jwks = null;

const textEncoder = new TextEncoder();

const getJWKS = () => {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(env.keycloak.jwksUri));
  }
  return jwks;
};

const toUpperSnake = (value = '') => {
  const normalized = String(value).trim().replace(/[\s-]+/g, '_');
  let result = '';

  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index];
    const previous = normalized[index - 1];

    if (
      index > 0 &&
      current >= 'A' &&
      current <= 'Z' &&
      previous &&
      previous !== '_' &&
      !(previous >= 'A' && previous <= 'Z')
    ) {
      result += '_';
    }

    result += current.toUpperCase();
  }

  return result;
};

const normalizeRole = (value) => ENGINE_B_ROLE_ALIASES[toUpperSnake(value)] ?? null;

const claimValues = (value) => {
  if (Array.isArray(value)) return value.filter((entry) => typeof entry === 'string');
  if (typeof value === 'string') return [value];
  return [];
};

const extractRoleCandidates = (payload) => {
  const candidates = [
    ...claimValues(payload.roles),
    ...claimValues(payload.role),
    ...claimValues(payload[ROLE_CLAIM]),
    ...claimValues(payload.realm_access?.roles),
  ];

  return [...new Set(candidates.map((entry) => entry.trim()).filter(Boolean))];
};

const getDisplayName = (payload) =>
  (typeof payload.name === 'string' && payload.name.trim()) ||
  (typeof payload.username === 'string' && payload.username.trim()) ||
  (typeof payload.email === 'string' && payload.email.trim()) ||
  'Utilisateur';

const buildUserFromPayload = (payload) => {
  const rawRoles = extractRoleCandidates(payload);
  const normalizedRole = rawRoles.map(normalizeRole).find(Boolean) ?? null;
  const displayName = getDisplayName(payload);

  return {
    id: typeof payload.sub === 'string' ? payload.sub : env.mock.userId,
    role: normalizedRole,
    rawRole: rawRoles[0] ?? null,
    email:
      (typeof payload.email === 'string' && payload.email.trim()) ||
      (typeof payload.username === 'string' && payload.username.trim()) ||
      '',
    nameFr: displayName,
    nameAr: displayName,
    tenantId: typeof payload.tenant_id === 'string' ? payload.tenant_id.trim() : null,
  };
};

const verifyEngineBToken = async (token) => {
  const { payload } = await jwtVerify(token, textEncoder.encode(env.engineBAuth.secret), {
    issuer: env.engineBAuth.issuer,
    audience: env.engineBAuth.audience,
  });

  return payload;
};

const verifyKeycloakToken = async (token) => {
  const { payload } = await jwtVerify(token, getJWKS(), {
    issuer: env.keycloak.issuer,
    audience: env.keycloak.clientId,
  });

  return payload;
};

const verifyIncomingToken = async (token) => {
  try {
    return await verifyEngineBToken(token);
  } catch (engineBError) {
    if (!env.keycloak.jwksUri) throw engineBError;
    return verifyKeycloakToken(token);
  }
};

const issueMockAuthToken = async (account) => {
  const expiry = new Date(Date.now() + env.engineBAuth.expiresInMinutes * 60_000);
  const rawRole = account.rawRole ?? 'User';
  const roleClaim = toUpperSnake(rawRole);

  const token = await new SignJWT({
    email: account.email,
    username: account.email,
    name: account.fullName,
    roles: [roleClaim],
    [ROLE_CLAIM]: rawRole,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(env.engineBAuth.issuer)
    .setAudience(env.engineBAuth.audience)
    .setSubject(account.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiry.getTime() / 1000))
    .sign(textEncoder.encode(env.engineBAuth.secret));

  return {
    token,
    expiry: expiry.toISOString(),
  };
};

module.exports = {
  buildUserFromPayload,
  extractRoleCandidates,
  issueMockAuthToken,
  normalizeRole,
  toUpperSnake,
  verifyIncomingToken,
};
