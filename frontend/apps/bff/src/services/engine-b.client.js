// ─────────────────────────────────────────────────────────────────────────────
// Engine-B HTTP client.
//
// Engine-B (ASP.NET) is the source of truth for CRM, Finance, and Procurement.
// This client mirrors engine-a.client.js: it forwards a Bearer token, retries
// on 502/503/504 and transient network errors, normalizes the
// `{ success, data, pagination, errors, message }` envelope, and projects
// non-2xx responses into AppError so the BFF surfaces a consistent error
// shape to the frontend.
// ─────────────────────────────────────────────────────────────────────────────

const env = require('../config/env');
const { AppError } = require('../errors/AppError');
const { getEngineBToken } = require('./engine-b.token');

const DEFAULT_TIMEOUT_MS = env.engineBTimeoutMs;
const DEFAULT_RETRIES    = env.engineBRetries;
const SERVICE_TOKEN      = process.env.ENGINE_B_SERVICE_TOKEN ?? '';

// Tokens we cannot forward to engine-b (RS256 from Keycloak or opaque mock
// dev-login tokens). When we see one we mint a fresh HS256 service token
// signed with the shared ERP_JWT_SECRET instead.
const MOCK_TOKEN_PREFIX = 'mock-token-';
const isForwardableEngineBToken = (token) => {
  if (!token) return false;
  if (token.startsWith(MOCK_TOKEN_PREFIX)) return false;
  // Engine-B tokens are HS256 with header alg=HS256. Keycloak tokens are RS256
  // and would be rejected by engine-b's signature validation. We sniff the
  // header — if it's not HS256, mint our own.
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  try {
    const header = JSON.parse(
      Buffer.from(token.slice(0, dot), 'base64url').toString('utf8'),
    );
    return header?.alg === 'HS256';
  } catch {
    return false;
  }
};

const buildUrl = (path, query) => {
  const base = env.engineBUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (!query || Object.keys(query).length === 0) return `${base}${suffix}`;

  const usp = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) value.forEach((v) => usp.append(key, String(v)));
    else usp.append(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `${base}${suffix}?${qs}` : `${base}${suffix}`;
};

// Resolve an HS256 bearer token engine-b will accept.
//
// Order of preference:
//   1. Caller-supplied ctx.token (already validated as engine-b-compatible)
//   2. The request's Authorization header — only if it's an HS256 JWT
//      (Keycloak RS256 tokens and our `mock-token-*` opaque dev tokens are
//      rejected here and skipped, otherwise engine-b returns 401)
//   3. A freshly minted (cached) HS256 service token derived from req.user
//   4. The static ENGINE_B_SERVICE_TOKEN env, for cron/internal callers
const resolveToken = async (ctx) => {
  if (ctx?.token) return ctx.token;

  const fromHeader = ctx?.req?.headers?.authorization?.startsWith('Bearer ')
    ? ctx.req.headers.authorization.slice(7)
    : null;
  if (fromHeader && isForwardableEngineBToken(fromHeader)) return fromHeader;

  // Mint a service token bound to the BFF user (or a service identity).
  if (ctx?.req?.user || ctx?.user) {
    return getEngineBToken(ctx.req?.user ?? ctx.user);
  }
  if (SERVICE_TOKEN) return SERVICE_TOKEN;
  return getEngineBToken(null);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status) => status === 502 || status === 503 || status === 504;
const isRetryableError  = (err) =>
  err?.name === 'AbortError' || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT';

// Engine-B error envelope: { success:false, errors:{ field: msg }, message }.
// We map to BFF AppError so the global error handler renders
// { error: { code, message, field } } per spec.
const mapEngineErrorToAppError = (status, body) => {
  if (status === 401) return new AppError('UNAUTHORIZED', 'Engine-B: token rejeté.', 401);
  if (status === 403) return new AppError('FORBIDDEN',    'Engine-B: accès refusé.', 403);
  if (status === 404) {
    return new AppError(
      'NOT_FOUND',
      body?.message || 'Ressource Engine-B introuvable.',
      404,
    );
  }

  if (body && body.success === false) {
    const fieldErrors = body.errors || {};
    const firstField  = Object.keys(fieldErrors)[0];
    return new AppError(
      status === 409 ? 'CONFLICT' : 'ENGINE_B_ERROR',
      body.message || (firstField ? fieldErrors[firstField] : 'Erreur Engine-B.'),
      status >= 400 && status < 600 ? status : 502,
      firstField,
    );
  }

  return new AppError(
    'ENGINE_B_UNAVAILABLE',
    `Engine-B a répondu ${status}.`,
    status >= 500 ? 502 : status,
  );
};

const parseBody = async (response) => {
  const ctype = response.headers.get('content-type') || '';
  if (response.status === 204) return null;
  if (!ctype.includes('application/json')) {
    return await response.text().catch(() => null);
  }
  return await response.json().catch(() => null);
};

/**
 * Low-level Engine-B request. Returns the parsed `data` field of the
 * `ApiResult`-style envelope, plus pagination metadata when present.
 *
 * @param {{
 *   method?: string,
 *   path:    string,
 *   query?:  object,
 *   body?:   any,
 *   ctx?:    { token?: string, req?: import('express').Request },
 *   headers?: object,
 *   timeoutMs?: number,
 *   retries?:   number,
 *   raw?:       boolean,
 * }} opts
 * @returns {Promise<{ data: any, pagination?: object, message?: string }>}
 */
const request = async ({
  method = 'GET',
  path,
  query,
  body,
  ctx,
  headers: extraHeaders,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries   = DEFAULT_RETRIES,
  raw       = false,
} = {}) => {
  const url   = buildUrl(path, query);
  const token = await resolveToken(ctx);

  const headers = {
    Accept:         'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (ctx?.req?.requestId) headers['X-Request-Id'] = ctx.req.requestId;
  if (extraHeaders && typeof extraHeaders === 'object') {
    Object.assign(headers, extraHeaders);
  }

  const init = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let attempt = 0;
  let lastErr;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      const parsed = await parseBody(response);

      if (!response.ok) {
        if (isRetryableStatus(response.status) && attempt < retries) {
          attempt += 1;
          await sleep(150 * attempt);
          continue;
        }
        throw mapEngineErrorToAppError(response.status, parsed);
      }

      if (raw) return parsed;

      if (parsed && typeof parsed === 'object' && 'success' in parsed) {
        if (parsed.success === false) {
          throw mapEngineErrorToAppError(response.status, parsed);
        }
        return {
          data:       parsed.data,
          pagination: parsed.pagination,
          message:    parsed.message,
        };
      }

      // Engine-B may return a bare DTO for some endpoints (no envelope).
      return { data: parsed };
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof AppError) throw err;
      lastErr = err;
      if (isRetryableError(err) && attempt < retries) {
        attempt += 1;
        await sleep(150 * attempt);
        continue;
      }
      break;
    }
  }

  throw new AppError(
    'ENGINE_B_UNAVAILABLE',
    `Engine-B injoignable: ${lastErr?.message || 'erreur réseau'}`,
    502,
  );
};

const get   = (path, opts = {})       => request({ method: 'GET',    path, ...opts });
const post  = (path, body, opts = {}) => request({ method: 'POST',   path, body, ...opts });
const put   = (path, body, opts = {}) => request({ method: 'PUT',    path, body, ...opts });
const patch = (path, body, opts = {}) => request({ method: 'PATCH',  path, body, ...opts });
const del   = (path, opts = {})       => request({ method: 'DELETE', path, ...opts });

module.exports = {
  request,
  get,
  post,
  put,
  patch,
  del,
  buildUrl,
};
