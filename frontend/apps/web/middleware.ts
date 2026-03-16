import { NextRequest, NextResponse } from "next/server";

const locales = ["fr", "ar"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/fr${pathname}`;
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  const matchedLocale =
    locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) ??
    locales[0];
  requestHeaders.set("x-next-intl-locale", matchedLocale);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"]
};
