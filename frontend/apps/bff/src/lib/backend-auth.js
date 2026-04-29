const { SignJWT } = require('jose');
const env = require('../config/env');

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const textEncoder = new TextEncoder();

const USER_ROLE_MAP = {
  SUPERADMIN: ['SUPER_ADMIN', 'PRODUCT_MANAGER', 'INVENTORY_MANAGER', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'REPORTING_ANALYST'],
  PRODUCT_MANAGER: ['PRODUCT_MANAGER', 'REPORTING_ANALYST'],
  CATALOGUE_MANAGER: ['PRODUCT_MANAGER', 'REPORTING_ANALYST'],
  INVENTORY_MANAGER: ['INVENTORY_MANAGER', 'REPORTING_ANALYST'],
  PROCUREMENT_MANAGER: ['PROCUREMENT_MANAGER', 'REPORTING_ANALYST'],
  FINANCE_DIRECTOR: ['FINANCE_MANAGER', 'REPORTING_ANALYST'],
  ANALYST: ['REPORTING_ANALYST'],
  OMS_OPERATOR: ['LOGISTICS_AGENT', 'REPORTING_ANALYST'],
  CRM_AGENT: ['CRM_AGENT', 'REPORTING_ANALYST'],
};

const PROVISIONING_ROLES = [
  'SUPER_ADMIN',
  'PRODUCT_MANAGER',
  'INVENTORY_MANAGER',
  'PROCUREMENT_MANAGER',
  'FINANCE_MANAGER',
  'REPORTING_ANALYST',
];

const unique = (values = []) => [...new Set(values.filter(Boolean))];

const getTenantId = (user) => {
  if (typeof user?.tenantId === 'string' && user.tenantId.trim()) {
    return user.tenantId.trim();
  }

  return 'default';
};

const getBackendRolesForUser = (user) => unique(USER_ROLE_MAP[user?.role] ?? []);

const issueBackendToken = async ({
  user,
  roles,
  actorId,
  actorName,
  expiresInMinutes = 15,
}) => {
  const effectiveRoles = unique(roles?.length ? roles : getBackendRolesForUser(user));

  if (effectiveRoles.length === 0) {
    throw new Error('Aucun role backend disponible pour generer un jeton interne.');
  }

  const subject = actorId ?? user?.id ?? 'bff-user';
  const username = user?.email || subject;
  const displayName = actorName ?? user?.nameFr ?? user?.email ?? subject;
  const expiry = new Date(Date.now() + expiresInMinutes * 60_000);

  return new SignJWT({
    email: user?.email || '',
    username,
    name: displayName,
    tenant_id: getTenantId(user),
    roles: effectiveRoles,
    [ROLE_CLAIM]: effectiveRoles[0],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(env.engineBAuth.issuer)
    .setAudience(env.engineBAuth.audience)
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiry.getTime() / 1000))
    .sign(textEncoder.encode(env.sharedJwtSecret));
};

const issueProvisioningTokens = async (user, prefix = 'bff-provisioning') => ({
  creatorToken: await issueBackendToken({
    user,
    roles: PROVISIONING_ROLES,
    actorId: `${prefix}-creator`,
    actorName: 'BFF Provisioning Creator',
  }),
  approverToken: await issueBackendToken({
    user,
    roles: PROVISIONING_ROLES,
    actorId: `${prefix}-approver`,
    actorName: 'BFF Provisioning Approver',
  }),
});

module.exports = {
  PROVISIONING_ROLES,
  getBackendRolesForUser,
  getTenantId,
  issueBackendToken,
  issueProvisioningTokens,
};
