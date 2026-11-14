import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/rbac/constants";
import { LOCALE_COOKIE_NAME, type Locale } from "@/i18n/config";

/**
 * Edge-compatible fast path only: redirects requests with no session cookie
 * at all away from /admin. This is a UX optimization, NOT the security
 * boundary — firebase-admin needs the Node.js runtime (crypto), which
 * Middleware's Edge runtime doesn't support, so the cookie's signature,
 * expiry, and the caller's role are verified server-side in
 * app/admin/layout.tsx via lib/rbac/guards.ts on every request.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Prime the locale cookie on first visit only — never overwrite a
  // language the visitor already picked via the language switcher.
  // Admin pages default to English, public verification/login pages to
  // Khmer, matching each area's existing (pre-i18n) UX.
  if (!request.cookies.has(LOCALE_COOKIE_NAME)) {
    const defaultLocale: Locale = isAdminRoute ? "en" : "km";
    response.cookies.set(LOCALE_COOKIE_NAME, defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/login", "/unauthorized"],
};
