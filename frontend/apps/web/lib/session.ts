import type { Role } from '@ferza/shared';

export type SessionLocale = 'fr' | 'ar';

export interface FerzaSession {
  userId: string;
  nameFr: string;
  nameAr: string;
  email: string;
  role: Role | null;
  roleLabel: string;
  rawRole: string | null;
  locale: SessionLocale;
  token: string;
  expiresAt: string | null;
}

type TokenPayload = {
  sub?: string;
  email?: string;
  username?: string;
  exp?: number;
  roles?: string[] | string;
  role?: string[] | string;
  realm_access?: { roles?: string[] };
  [key: string]: unknown;
};

type PersistedSessionInput = {
  token: string;
  expiry: string | null;
  locale: SessionLocale;
  rememberMe: boolean;
};

const SESSION_COOKIE = 'ferza_session';
const TOKEN_STORAGE_KEY = 'ferza.auth.token';
const EXPIRY_STORAGE_KEY = 'ferza.auth.expiry';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export const AUTH_SESSION_EVENT = 'ferza:auth-session-changed';

const ROLE_ALIASES: Record<string, Role> = {
  SUPER_ADMIN: 'SUPERADMIN',
  SUPERADMIN: 'SUPERADMIN',
  PRODUCT_MANAGER: 'PRODUCT_MANAGER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  FINANCE_MANAGER: 'FINANCE_DIRECTOR',
  FINANCE_DIRECTOR: 'FINANCE_DIRECTOR',
  PROCUREMENT_MANAGER: 'PROCUREMENT_MANAGER',
  CRM_AGENT: 'CRM_AGENT',
  CRM_MANAGER: 'CRM_AGENT',
  LOGISTICS_AGENT: 'OMS_OPERATOR',
  OMS_OPERATOR: 'OMS_OPERATOR',
  REPORTING_ANALYST: 'ANALYST',
  ANALYST: 'ANALYST',
  WAREHOUSE_OPERATOR: 'INVENTORY_MANAGER',
  CATALOGUE_MANAGER: 'CATALOGUE_MANAGER',
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'SuperAdmin',
  SUPERADMIN: 'SuperAdmin',
  PRODUCT_MANAGER: 'ProductManager',
  INVENTORY_MANAGER: 'InventoryManager',
  FINANCE_MANAGER: 'FinanceManager',
  FINANCE_DIRECTOR: 'FinanceDirector',
  PROCUREMENT_MANAGER: 'ProcurementManager',
  CRM_AGENT: 'CRMAgent',
  CRM_MANAGER: 'CRMAgent',
  LOGISTICS_AGENT: 'LogisticsAgent',
  OMS_OPERATOR: 'LogisticsAgent',
  REPORTING_ANALYST: 'ReportingAnalyst',
  ANALYST: 'ReportingAnalyst',
  WAREHOUSE_OPERATOR: 'WarehouseOperator',
  CATALOGUE_MANAGER: 'CatalogueManager',
  USER: 'User',
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = globalThis.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

const toUpperSnake = (value = ''): string => {
  const normalized = value.trim().replace(/[\s-]+/g, '_');
  let result = '';

  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index]!;
    const previous = normalized[index - 1];

    if (
      index > 0 &&
      current >= 'A' &&
      current <= 'Z' &&
      previous &&
      previous !== '_' &&
      !(previous >= 'A' && previous <= 'Z')
    ) {
      result += '_';
    }

    result += current.toUpperCase();
  }

  return result;
};

const claimValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  if (typeof value === 'string') return [value];
  return [];
};

export const decodeTokenPayload = (token: string): TokenPayload | null => {
  const [, payload] = token.split('.');

  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as TokenPayload;
  } catch {
    return null;
  }
};

export const extractRoleCandidates = (payload: TokenPayload | null): string[] => {
  if (!payload) return [];

  const candidates = [
    ...claimValues(payload.roles),
    ...claimValues(payload.role),
    ...claimValues(payload[ROLE_CLAIM]),
    ...claimValues(payload.realm_access?.roles),
  ];

  return [...new Set(candidates.map((entry) => entry.trim()).filter(Boolean))];
};

export const normalizeAuthRole = (value: string | null | undefined): Role | null => {
  if (!value) return null;
  return ROLE_ALIASES[toUpperSnake(value)] ?? null;
};

const getRoleLabel = (value: string | null): string => {
  if (!value) return 'Role non attribue';
  const normalized = toUpperSnake(value);
  return ROLE_LABELS[normalized] ?? value;
};

const getDisplayName = (email: string): string => {
  const localPart = email.split('@')[0] ?? '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();

  if (!cleaned) return 'Utilisateur';

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const isPayloadExpired = (payload: TokenPayload | null): boolean => {
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 <= Date.now();
};

const getCookieAttributes = (): string[] => {
  const parts = ['Path=/', 'SameSite=Lax'];

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    parts.push('Secure');
  }

  return parts;
};

const readStoredAuth = (): { token: string; expiry: string | null } | null => {
  if (typeof window === 'undefined') return null;

  const storageOrder = [window.localStorage, window.sessionStorage];

  for (const storage of storageOrder) {
    const token = storage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      return {
        token,
        expiry: storage.getItem(EXPIRY_STORAGE_KEY),
      };
    }
  }

  return null;
};

export const getSessionFromToken = (
  token: string | null | undefined,
  locale: SessionLocale,
  expiryHint?: string | null,
): FerzaSession | null => {
  if (!token) return null;

  const decodedToken = decodeURIComponent(token);
  const payload = decodeTokenPayload(decodedToken);

  if (!payload || isPayloadExpired(payload)) return null;

  const rawRole = extractRoleCandidates(payload)[0] ?? null;
  const email =
    (typeof payload.email === 'string' && payload.email.trim()) ||
    (typeof payload.username === 'string' && payload.username.trim()) ||
    '';
  const displayName = getDisplayName(email);

  return {
    userId: typeof payload.sub === 'string' ? payload.sub : email || 'anonymous',
    nameFr: displayName,
    nameAr: displayName,
    email,
    role: normalizeAuthRole(rawRole),
    roleLabel: getRoleLabel(rawRole),
    rawRole,
    locale,
    token: decodedToken,
    expiresAt:
      expiryHint ??
      (typeof payload.exp === 'number'
        ? new Date(payload.exp * 1000).toISOString()
        : null),
  };
};

export const getStoredSession = (locale: SessionLocale): FerzaSession | null => {
  const stored = readStoredAuth();
  const session = getSessionFromToken(stored?.token, locale, stored?.expiry ?? null);

  if (!session && stored) {
    clearStoredAuthSession();
  }

  return session;
};

export const persistAuthSession = ({
  token,
  expiry,
  locale,
  rememberMe,
}: PersistedSessionInput): FerzaSession | null => {
  if (typeof window === 'undefined') return null;

  clearStoredAuthSession({ emitEvent: false });

  const targetStorage = rememberMe ? window.localStorage : window.sessionStorage;
  const session = getSessionFromToken(token, locale, expiry);

  if (!session) return null;

  targetStorage.setItem(TOKEN_STORAGE_KEY, token);

  if (expiry) {
    targetStorage.setItem(EXPIRY_STORAGE_KEY, expiry);
  }

  const cookieParts = [`${SESSION_COOKIE}=${encodeURIComponent(token)}`, ...getCookieAttributes()];

  if (rememberMe && expiry) {
    cookieParts.push(`Expires=${new Date(expiry).toUTCString()}`);
  }

  document.cookie = cookieParts.join('; ');
  dispatchAuthSessionEvent();

  return session;
};

export const clearStoredAuthSession = (
  options: { emitEvent?: boolean } = {},
): void => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(EXPIRY_STORAGE_KEY);
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(EXPIRY_STORAGE_KEY);

  document.cookie = [
    `${SESSION_COOKIE}=`,
    ...getCookieAttributes(),
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('; ');

  if (options.emitEvent !== false) {
    dispatchAuthSessionEvent();
  }
};

export const dispatchAuthSessionEvent = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};
