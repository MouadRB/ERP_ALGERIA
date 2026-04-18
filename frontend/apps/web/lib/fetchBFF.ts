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
}

// ─── Core function ────────────────────────────────────────────────────────────

export const fetchBFF = async <T>(
  path:    string,
  options: FetchBFFOptions = {},
): Promise<T> => {
  const { method = 'GET', body, params } = options;

  const response = await fetch(buildURL(path, params), {
    method,
    headers: { 'Content-Type': 'application/json' },
    cache:   'no-store',
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
