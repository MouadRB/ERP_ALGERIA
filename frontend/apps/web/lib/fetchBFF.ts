import type { ApiError } from '@ferza/shared';

export class BFFError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly field?: string;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = 'BFFError';
    this.code = error.code;
    this.status = status;
    this.field = error.field;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ParamValue = string | number | boolean | null | undefined;

const isParamValue = (value: unknown): value is ParamValue =>
  value === null ||
  value === undefined ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

interface FetchBFFOptions<TBody = unknown, TParams extends object = object> {
  method?: HttpMethod;
  body?: TBody;
  params?: TParams;
}

const buildURL = <TParams extends object>(
  path: string,
  params?: TParams | URLSearchParams,
): string => {
  const base = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? 'http://localhost:4000';
  const url = new URL(`${base}${path}`);

  if (params) {
    if (params instanceof URLSearchParams) {
      params.forEach((value, key) => {
        if (value !== '') {
          url.searchParams.set(key, value);
        }
      });
    } else {
      Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        if (isParamValue(value) && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }
  }

  return url.toString();
};

/**
 * Typed fetch wrapper for all BFF calls.
 *
 * Usage:
 *   fetchBFF<ApiResponse<Order[]>>('/bff/oms', { params: { page: 1, pageSize: 20 } })
 *   fetchBFF<ApiResponse<Order>>('/bff/oms/ORD-001')
 *   fetchBFF('/bff/oms/ORD-001/confirm', { method: 'PATCH' })
 *   fetchBFF('/bff/oms', { method: 'POST', body: { ... } })
 */
export const fetchBFF = async <
  T,
  TBody = unknown,
  TParams extends object = object
>(
  path: string,
  options: FetchBFFOptions<TBody, TParams> = {},
): Promise<T> => {
  const { method = 'GET', body, params } = options;

  const url = buildURL(path, params);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    let errorPayload: unknown;
    try {
      errorPayload = await response.json();
    } catch {
      throw new BFFError(
        { code: 'NETWORK_ERROR', message: 'Impossible de contacter le BFF.' },
        response.status,
      );
    }

    const normalizedError: ApiError = (() => {
      if (typeof errorPayload === 'string') {
        return { code: 'BFF_ERROR', message: errorPayload };
      }

      if (errorPayload && typeof errorPayload === 'object') {
        const payload = errorPayload as { error?: unknown };
        if (typeof payload.error === 'string') {
          return { code: 'BFF_ERROR', message: payload.error };
        }
        if (
          payload.error &&
          typeof payload.error === 'object' &&
          'message' in payload.error
        ) {
          return payload.error as ApiError;
        }
      }

      return { code: 'BFF_ERROR', message: 'Erreur BFF inconnue.' };
    })();

    throw new BFFError(normalizedError, response.status);
  }

  return response.json() as Promise<T>;
};

export const postBFF = async <
  T,
  TBody = unknown,
  TParams extends object = object
>(
  path: string,
  body: TBody,
  options: Omit<FetchBFFOptions<TBody, TParams>, 'method' | 'body'> = {},
): Promise<T> =>
  fetchBFF<T, TBody, TParams>(path, {
    ...options,
    method: 'POST',
    body,
  });
