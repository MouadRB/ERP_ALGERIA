const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  useMock: process.env.USE_MOCK === 'true',

  engineAUrl: process.env.ENGINE_A_URL ?? 'http://localhost:8080',
  engineBUrl: process.env.ENGINE_B_URL ?? 'http://localhost:5000',

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
