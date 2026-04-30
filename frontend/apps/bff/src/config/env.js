const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  useMock: process.env.USE_MOCK === 'true',
  authUseMock: process.env.AUTH_USE_MOCK
    ? process.env.AUTH_USE_MOCK === 'true'
    : process.env.USE_MOCK === 'true',

  engineAUrl: process.env.ENGINE_A_URL ?? 'http://localhost:8082',
  engineAServiceToken: process.env.ENGINE_A_SERVICE_TOKEN ?? '',
  engineATimeoutMs: parseInt(process.env.ENGINE_A_TIMEOUT_MS ?? '15000', 10),
  engineARetries: parseInt(process.env.ENGINE_A_RETRIES ?? '2', 10),
  mdmUrl: process.env.MDM_URL ?? 'http://localhost:8081',
  engineBUrl: process.env.ENGINE_B_URL ?? 'http://localhost:5220',
  engineBTimeoutMs: parseInt(process.env.ENGINE_B_TIMEOUT_MS ?? '15000', 10),
  engineBRetries:   parseInt(process.env.ENGINE_B_RETRIES   ?? '2', 10),

  // Shared HS256 secret used by engine-a / engine-b / mdm-service. The BFF
  // mints short-lived service tokens with it for upstream calls.
  erpJwtSecret: process.env.ERP_JWT_SECRET
    ?? process.env.ENGINE_B_JWT_SECRET
    ?? 'changeme-in-production-use-256-bit-minimum-key-here-please',
  engineBIssuer:   process.env.ENGINE_B_JWT_ISSUER   ?? 'engine-b',
  engineBAudience: process.env.ENGINE_B_JWT_AUDIENCE ?? 'erp-algeria-clients',
  // Legacy nested shape kept for callers that still read env.engineBAuth.*
  engineBAuth: {
    secret:
      process.env.ERP_JWT_SECRET ??
      process.env.ENGINE_B_JWT_SECRET ??
      'changeme-in-production-use-256-bit-minimum-key-here-please',
    issuer: process.env.ENGINE_B_JWT_ISSUER ?? 'engine-b',
    audience: process.env.ENGINE_B_JWT_AUDIENCE ?? 'erp-algeria-clients',
    expiresInMinutes: parseInt(process.env.ENGINE_B_JWT_EXPIRES_IN_MINUTES ?? '60', 10),
  },
  sharedJwtSecret:
    process.env.ERP_JWT_SECRET ??
    process.env.JWT_SECRET ??
    process.env.ENGINE_B_JWT_SECRET ??
    'changeme-in-production-use-256-bit-minimum-key-here-please',

  keycloak: {
    realm: process.env.KEYCLOAK_REALM ?? 'ferza',
    clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'ferza-bff',
    issuer: process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8180/realms/ferza',
    jwksUri: process.env.KEYCLOAK_JWKS_URI ?? 'http://localhost:8180/realms/ferza/protocol/openid-connect/certs',
  },

  mock: {
    userId: process.env.MOCK_USER_ID ?? 'usr-dev-001',
    role: process.env.MOCK_USER_ROLE ?? 'SUPERADMIN',
    nameFr: process.env.MOCK_USER_NAME_FR ?? 'Haroun Développeur',
    nameAr: process.env.MOCK_USER_NAME_AR ?? 'هارون مطور',
  },

  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:3000').split(','),
};

module.exports = env;
