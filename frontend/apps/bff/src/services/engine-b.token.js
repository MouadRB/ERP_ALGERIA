// ─────────────────────────────────────────────────────────────────────────────
// Engine-B service-token minter.
//
// Engine-B (ASP.NET) only accepts HS256 JWTs signed with the shared
// ERP_JWT_SECRET, with issuer/audience matching its `AcceptedIssuers` /
// `AcceptedAudiences` config. The BFF cannot forward Keycloak (RS256) tokens
// or our local `mock-token-*` opaque strings to engine-b — they would be
// rejected with 401.
//
// Strategy: mint a short-lived HS256 token signed with ERP_JWT_SECRET,
// embedding the caller's BFF role(s) under both the JWT-standard `role`
// claim (auto-mapped to ClaimTypes.Role by ASP.NET) AND the custom `roles`
// claim consumed by engine-b's RolesClaimsTransformer. This satisfies
// `[Authorize(Policy = "OrdersRead" | "OrdersWrite")]` for any BFF user.
//
// Tokens are cached in-memory per role-set for ~50 minutes (TTL is 60 min
// minus a 10-minute safety margin). We re-mint when the cache misses or the
// token is close to expiry.
// ─────────────────────────────────────────────────────────────────────────────

const { SignJWT } = require('jose');
const env = require('../config/env');

const SECRET_BYTES   = new TextEncoder().encode(env.erpJwtSecret);
const TOKEN_TTL_SEC  = 60 * 60;          // 60 min — same as engine-b default
const SAFETY_MARGIN  = 10 * 60 * 1000;   // re-mint 10 min before exp

// FERZA roles → engine-b role names. engine-b's RolesClaimsTransformer accepts
// the UPPER_SNAKE form (e.g. "SUPER_ADMIN") and `Both()` policy registration
// already accepts both PascalCase and UPPER_SNAKE, so emitting UPPER_SNAKE is
// safe across every engine-b policy.
const FERZA_TO_ENGINE_B_ROLES = {
  SUPERADMIN:          ['SUPER_ADMIN'],
  PRODUCT_MANAGER:     ['PRODUCT_MANAGER'],
  INVENTORY_MANAGER:   ['INVENTORY_MANAGER'],
  PROCUREMENT_MANAGER: ['PROCUREMENT_MANAGER'],
  CRM_AGENT:           ['CRM_AGENT'],
  OMS_OPERATOR:        ['LOGISTICS_AGENT'],
  CATALOGUE_MANAGER:   ['PRODUCT_MANAGER'],
  ANALYST:             ['REPORTING_ANALYST'],
  FINANCE_DIRECTOR:    ['FINANCE_MANAGER'],
};

const SERVICE_FALLBACK_ROLES = ['SUPER_ADMIN'];

const cache = new Map(); // key = sorted-roles, value = { token, expMs }

const rolesForUser = (user) => {
  if (!user?.role) return SERVICE_FALLBACK_ROLES;
  return FERZA_TO_ENGINE_B_ROLES[user.role] ?? SERVICE_FALLBACK_ROLES;
};

const cacheKey = (roles, subject) => `${subject}|${[...roles].sort().join(',')}`;

const mint = async ({ roles, subject, username }) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const exp    = nowSec + TOKEN_TTL_SEC;

  const jwt = await new SignJWT({
    // ASP.NET's JwtBearer maps the JWT-standard `role` claim onto
    // ClaimTypes.Role automatically.
    role:      roles,
    // engine-b's RolesClaimsTransformer reads this custom claim too.
    roles,
    username,
    tenant_id: 'default',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(subject)
    .setIssuer(env.engineBIssuer)
    .setAudience(env.engineBAudience)
    .setIssuedAt(nowSec)
    .setExpirationTime(exp)
    .setJti(`${subject}-${nowSec}`)
    .sign(SECRET_BYTES);

  return { token: jwt, expMs: exp * 1000 };
};

/**
 * Mint (or reuse a cached) HS256 token for engine-b.
 *
 * @param {{ id?: string, role?: string, nameFr?: string }} user
 * @returns {Promise<string>} bearer token
 */
const getEngineBToken = async (user) => {
  const roles    = rolesForUser(user);
  const subject  = user?.id ?? 'bff-service';
  const username = user?.nameFr ?? 'bff';
  const key      = cacheKey(roles, subject);

  const hit = cache.get(key);
  if (hit && hit.expMs - Date.now() > SAFETY_MARGIN) return hit.token;

  const fresh = await mint({ roles, subject, username });
  cache.set(key, fresh);
  return fresh.token;
};

const clearTokenCache = () => cache.clear();

module.exports = { getEngineBToken, clearTokenCache, rolesForUser };
