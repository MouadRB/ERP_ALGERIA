const env = require('../config/env');
const { AppError } = require('../errors/AppError');

const DEFAULT_TIMEOUT_MS = parseInt(process.env.ENGINE_A_TIMEOUT_MS ?? '15000', 10);
const DEFAULT_RETRIES = parseInt(process.env.ENGINE_A_RETRIES ?? '2', 10);
const SERVICE_TOKEN = process.env.ENGINE_A_SERVICE_TOKEN ?? '';

const buildUrl = (path, query) => {
  const base = env.engineAUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (!query || Object.keys(query).length === 0) return `${base}${suffix}`;

  const usp = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, String(v)));
    } else {
      usp.append(key, String(value));
    }
  });
  const qs = usp.toString();
  return qs ? `${base}${suffix}?${qs}` : `${base}${suffix}`;
};

const resolveToken = (ctx) => {
  if (ctx?.token) return ctx.token;
  return SERVICE_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmYtc2VydmljZSIsInRlbmFudF9pZCI6ImRlZmF1bHQiLCJ1c2VybmFtZSI6ImJmZiIsInJvbGVzIjpbIlNVUEVSX0FETUlOIiwiSU5WRU5UT1JZX01BTkFHRVIiLCJQUk9EVUNUX01BTkFHRVIiLCJBTkFMWVNUIl19.YCDKwQsldBPgMFtEslhHLWN8DhmSpbh89WOOb9sNHKE';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status) => status === 502 || status === 503 || status === 504;
const isRetryableError = (err) =>
  err?.name === 'AbortError' || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT';

const mapEngineErrorToAppError = (status, body) => {
  if (status === 401) return new AppError('UNAUTHORIZED', 'Engine-A: token rejeté.', 401);
  if (status === 403) return new AppError('FORBIDDEN', 'Engine-A: accès refusé.', 403);
  if (status === 404) {
    return new AppError(
      'NOT_FOUND',
      body?.message || 'Ressource Engine-A introuvable.',
      404,
    );
  }

  if (body && body.success === false) {
    const fieldErrors = body.errors || {};
    const firstField = Object.keys(fieldErrors)[0];
    return new AppError(
      status === 409 ? 'CONFLICT' : 'ENGINE_A_ERROR',
      body.message || 'Erreur Engine-A.',
      status >= 400 && status < 600 ? status : 502,
      firstField,
    );
  }

  return new AppError(
    'ENGINE_A_UNAVAILABLE',
    `Engine-A a répondu ${status}.`,
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
 * Low-level request to Engine-A. Returns the parsed `data` field of the
 * `ApiResult` envelope, plus pagination metadata when present.
 *
 * @param {{
 *   method?: string,
 *   path: string,
 *   query?: object,
 *   body?: any,
 *   ctx?: { token?: string, req?: import('express').Request },
 *   timeoutMs?: number,
 *   retries?: number,
 *   raw?: boolean,
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
  retries = DEFAULT_RETRIES,
  raw = false,
} = {}) => {
  const url = buildUrl(path, query);
  const token = resolveToken(ctx);

  const headers = {
    Accept: 'application/json',
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
    const timer = setTimeout(() => controller.abort(), timeoutMs);
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
          data: parsed.data,
          pagination: parsed.pagination,
          message: parsed.message,
        };
      }

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
    'ENGINE_A_UNAVAILABLE',
    `Engine-A injoignable: ${lastErr?.message || 'erreur réseau'}`,
    502,
  );
};

const get = (path, opts = {}) => request({ method: 'GET', path, ...opts });
const post = (path, body, opts = {}) => request({ method: 'POST', path, body, ...opts });
const patch = (path, body, opts = {}) => request({ method: 'PATCH', path, body, ...opts });
const put = (path, body, opts = {}) => request({ method: 'PUT', path, body, ...opts });
const del = (path, opts = {}) => request({ method: 'DELETE', path, ...opts });

module.exports = {
  request,
  get,
  post,
  patch,
  put,
  del,
  buildUrl,
};
