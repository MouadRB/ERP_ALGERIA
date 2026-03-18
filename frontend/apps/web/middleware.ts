import { NextRequest, NextResponse } from 'next/server';

const locales = ['fr', 'ar'];
const PUBLIC_PATHS = ['/login', '/403', '/404'];

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

    if (!isPublicPath) {
      const session = request.cookies.get('ferza_session');
      if (!session) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = `/${locale}/login`;
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};