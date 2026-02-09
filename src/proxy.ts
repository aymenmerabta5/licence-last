import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { getSessionCookie } from "better-auth/cookies"

import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export const PROTECTED_PATHS = ["/dashboard", "/onboarding", "/profile"]
export const AUTH_PATHS = ["/login", "/signup", "/reset-password"]

/**
 * Strip the locale prefix from a pathname.
 * e.g. /en/dashboard -> /dashboard, /fr/login -> /login
 */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr|ar)/, "")
}

/**
 * Check if a pathname is a protected path that requires authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  const path = stripLocale(pathname)
  return PROTECTED_PATHS.some((p) => path.startsWith(p))
}

/**
 * Check if a pathname is an auth page (login, signup, reset-password).
 */
export function isAuthPath(pathname: string): boolean {
  const path = stripLocale(pathname)
  return AUTH_PATHS.some((p) => path.startsWith(p))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = pathname.match(/^\/(en|fr|ar)/)?.[1] ?? "en"

  if (isProtectedPath(pathname)) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      return NextResponse.redirect(
        new URL(`/${locale}/login`, request.url),
      )
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath(pathname)) {
    const sessionCookie = getSessionCookie(request)
    if (sessionCookie) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }
  }

  // Delegate to next-intl for locale routing
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /static (inside /public)
  // - /.*\..*$ (files with extensions, e.g. favicon.ico)
  matcher: ["/((?!api|_next|_vercel|static|.*\\..*).*)"],
}
