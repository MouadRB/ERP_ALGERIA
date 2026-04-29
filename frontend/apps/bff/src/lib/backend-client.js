const env = require('../config/env');
const { AppError } = require('../errors/AppError');
const { getBackendRolesForUser, issueBackendToken } = require('./backend-auth');

const DEFAULT_TIMEOUT_MS = 30_000;

const buildUrl = (baseUrl, path, query = {}) => {
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null && entry !== '') {
          url.searchParams.append(key, String(entry));
        }
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
};

const readPayload = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const extractErrorMessage = (payload, fallback) => {
  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload?.error?.message === 'string' && payload.error.message.trim()) {
    return payload.error.message;
  }

  if (typeof payload?.raw === 'string' && payload.raw.trim()) {
    return payload.raw;
  }

  return fallback;
};

const toAppError = (response, payload, fallback) =>
  new AppError(
    response.status === 404
      ? 'NOT_FOUND'
      : response.status === 403
        ? 'FORBIDDEN'
        : response.status === 401
          ? 'UNAUTHORIZED'
          : response.status >= 400 && response.status < 500
            ? 'VALIDATION_ERROR'
            : 'UPSTREAM_ERROR',
    extractErrorMessage(payload, fallback),
    response.status,
  );

const requestJson = async ({
  baseUrl,
  path,
  method = 'GET',
  query,
  body,
  token,
  allow404 = false,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(baseUrl, path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const payload = await readPayload(response);

    if (allow404 && response.status === 404) {
      return null;
    }

    if (!response.ok || payload?.success === false) {
      throw toAppError(response, payload, `La requete vers ${path} a echoue.`);
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error?.name === 'AbortError') {
      throw new AppError('UPSTREAM_TIMEOUT', `Delai depasse pour ${path}.`, 504);
    }

    throw new AppError('UPSTREAM_UNAVAILABLE', `Impossible de joindre ${path}.`, 502);
  } finally {
    clearTimeout(timeout);
  }
};

const requestEngineA = async (user, path, options = {}) => {
  const token =
    options.token ??
    (await issueBackendToken({
      user,
      roles: options.roles ?? getBackendRolesForUser(user),
    }));

  return requestJson({
    ...options,
    baseUrl: env.engineAUrl,
    path,
    token,
  });
};

const requestMdm = async (user, path, options = {}) => {
  const token =
    options.token ??
    (await issueBackendToken({
      user,
      roles: options.roles ?? getBackendRolesForUser(user),
    }));

  return requestJson({
    ...options,
    baseUrl: env.mdmUrl,
    path,
    token,
  });
};

module.exports = {
  requestEngineA,
  requestJson,
  requestMdm,
};
