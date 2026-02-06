import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { getSessionCookie } from "better-auth/cookies"

import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ["/dashboard"]

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix (e.g. /en/dashboard -> /dashboard)
  const pathWithoutLocale = pathname.replace(
    /^\/(en|fr|ar)/,
    "",
  )
  return PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check auth for protected routes
  if (isProtectedPath(pathname)) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      const locale = pathname.match(/^\/(en|fr|ar)/)?.[1] ?? "en"
      return NextResponse.redirect(
        new URL(`/${locale}/sign-in`, request.url),
      )
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
