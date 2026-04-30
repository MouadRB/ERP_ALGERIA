import { NextRequest, NextResponse } from 'next/server';

const locales = ['fr', 'ar'];
const PUBLIC_PATHS = ['/login', '/signup', '/403', '/404', '/auth/google/callback'];
const AUTH_PATHS = ['/login', '/signup'];

const decodeSessionPayload = (token: string) => {
  try {
    const [, payload] = decodeURIComponent(token).split('.');
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json) as {
      exp?: number;
      roles?: string[] | string;
      role?: string[] | string;
      realm_access?: { roles?: string[] };
      ['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?: string | string[];
    };
  } catch {
    return null;
  }
};

const claimValues = (value: string[] | string | undefined): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
};

const toUpperSnake = (value: string): string => {
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

const hasSupportedRole = (token: string): boolean => {
  const payload = decodeSessionPayload(token);
  if (!payload) return false;

  const roles = [
    ...claimValues(payload.roles),
    ...claimValues(payload.role),
    ...claimValues(
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    ),
    ...claimValues(payload.realm_access?.roles),
  ].map((role) => toUpperSnake(role));

  const supportedRoles = new Set([
    'SUPER_ADMIN',
    'SUPERADMIN',
    'PRODUCT_MANAGER',
    'INVENTORY_MANAGER',
    'FINANCE_MANAGER',
    'FINANCE_DIRECTOR',
    'PROCUREMENT_MANAGER',
    'CRM_AGENT',
    'CRM_MANAGER',
    'LOGISTICS_AGENT',
    'OMS_OPERATOR',
    'REPORTING_ANALYST',
    'ANALYST',
    'WAREHOUSE_OPERATOR',
    'CATALOGUE_MANAGER',
  ]);

  return roles.some((role) => supportedRoles.has(role));
};

const hasValidSession = (token: string | undefined): boolean => {
  if (!token) return false;

  const payload = decodeSessionPayload(token);
  if (!payload) return false;
  if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) return false;

  return hasSupportedRole(token);
};

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // ─── Locale prefix ───────────────────────────────────────────────────────
  const hasLocale = locales.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/fr${pathname}`;
    return NextResponse.redirect(url);
  }

  // ─── Auth guard (real mode only) ─────────────────────────────────────────
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  if (!useMock) {
    const locale = pathname.split('/')[1];
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const isPublicPath = PUBLIC_PATHS.some(
      (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
    );
    const isAuthPath = AUTH_PATHS.some(
      (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
    );
    const token = request.cookies.get('ferza_session')?.value;
    const sessionIsValid = hasValidSession(token);

    if (!isPublicPath && !sessionIsValid) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('ferza_session');
      return response;
    }

    if (isAuthPath && sessionIsValid) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = `/${locale}/dashboard`;
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
