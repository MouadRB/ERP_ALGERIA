import { clearStoredAuthSession } from '@/lib/session';

// ─── Error class ─────────────────────────────────────────────────────────────

export interface BFFErrorPayload {
  code:     string;
  message:  string;
  field?:   string;
}

export class BFFError extends Error {
  public readonly code:    string;
  public readonly status:  number;
  public readonly field?:  string;

  constructor(payload: BFFErrorPayload, status: number) {
    super(payload.message);
    this.name   = 'BFFError';
    this.code   = payload.code;
    this.status = status;
    this.field  = payload.field;
  }
}

// ─── URL builder ─────────────────────────────────────────────────────────────

export type ParamValue = string | number | boolean | null | undefined;

const buildURL = (
  path: string,
  params?: Record<string, ParamValue>,
): string => {
  const base = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? 'http://localhost:4000';
  const url  = new URL(`${base}${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }

  return url.toString();
};

// ─── Options ──────────────────────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchBFFOptions<B = unknown> {
  method?: Method;
  body?:   B;
  params?: Record<string, ParamValue>;
  token?:  string;
}

const readCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const entry = document.cookie
    .split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(prefix));
  if (!entry) return null;
  return decodeURIComponent(entry.slice(prefix.length));
};

const resolveSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const fromCookie = readCookieValue('ferza_session');
  if (fromCookie) return fromCookie;

  return (
    window.localStorage.getItem('ferza.auth.token') ??
    window.localStorage.getItem('ferza.mock.token') ??
    window.sessionStorage.getItem('ferza.auth.token')
  );
};

// ─── Core function ────────────────────────────────────────────────────────────

export const fetchBFF = async <T>(
  path:    string,
  options: FetchBFFOptions = {},
): Promise<T> => {
  const { method = 'GET', body, params, token } = options;
  const sessionToken = token ?? resolveSessionToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;

  const response = await fetch(buildURL(path, params), {
    method,
    headers,
    cache:   'no-store',
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    let payload: { error: BFFErrorPayload };
    try {
      payload = await response.json();
    } catch {
      throw new BFFError(
        { code: 'NETWORK_ERROR', message: 'Impossible de contacter le BFF.' },
        response.status,
      );
    }

    if (response.status === 401 && typeof window !== 'undefined' && !path.startsWith('/bff/auth')) {
      clearStoredAuthSession();
    }

    throw new BFFError(payload.error, response.status);
  }

  return response.json() as Promise<T>;
};

export const postBFF = async <T, B = unknown>(
  path: string,
  body: B,
  options: Omit<FetchBFFOptions<B>, 'method' | 'body'> = {},
): Promise<T> =>
  fetchBFF<T>(path, { ...options, method: 'POST', body });
