/**
 * Keycloak PKCE Authorization Code Flow utilities.
 *
 * In mock mode these functions are bypassed — the login page
 * short-circuits directly to the dashboard.
 *
 * Real implementation connects to the Keycloak HA cluster.
 */

const KEYCLOAK_ISSUER =
  process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ??
  'http://localhost:8180/realms/ferza';

const CLIENT_ID =
  process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'ferza-web';

export const getAuthorizationUrl = (
  locale: string,
  redirectUri: string,
  codeChallenge: string,
): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    ui_locales: locale,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${KEYCLOAK_ISSUER}/protocol/openid-connect/auth?${params}`;
};

export const exchangeCodeForToken = async (
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> => {
  const res = await fetch(
    `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    },
  );
  if (!res.ok) throw new Error('Token exchange failed');
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> => {
  const res = await fetch(
    `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
      }),
    },
  );
  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
};