import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export const PROTECTED_PATHS = ["/dashboard", "/onboarding", "/profile"]
export const AUTH_PATHS = ["/login", "/signup", "/reset-password"]
export const MAINTENANCE_EXEMPT_PATHS = [
  "/login",
  "/signup",
  "/reset-password",
  "/verify",
  "/maintenance",
]

/**
 * Strip the locale prefix from a pathname.
 * e.g. /en/dashboard -> /dashboard, /fr/login -> /login
 */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, "")
}

function matchesPath(path: string, base: string): boolean {
  if (path === base) return true
  if (!path.startsWith(base)) return false

  const nextChar = path.charAt(base.length)
  return nextChar === "/" || nextChar === "?" || nextChar === "#"
}

/**
 * Check if a pathname is a protected path that requires authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  const path = stripLocale(pathname)
  return PROTECTED_PATHS.some((p) => matchesPath(path, p))
}

/**
 * Check if a pathname is an auth page (login, signup, reset-password).
 */
export function isAuthPath(pathname: string): boolean {
  const path = stripLocale(pathname)
  return AUTH_PATHS.some((p) => matchesPath(path, p))
}

/**
 * Check if a pathname should bypass maintenance-mode enforcement.
 */
export function isMaintenanceExemptPath(pathname: string): boolean {
  const path = stripLocale(pathname)
  return MAINTENANCE_EXEMPT_PATHS.some((p) => matchesPath(path, p))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const locale = pathname.match(/^\/(en|fr|ar)(?=\/|$)/)?.[1] ?? "en"

  if (!isMaintenanceExemptPath(pathname)) {
    try {
      const maintenanceUrl = new URL("/api/maintenance/status", request.url)
      const maintenanceResponse = await fetch(maintenanceUrl, {
        cache: "no-store",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      })

      if (maintenanceResponse.ok) {
        const { enabled, canBypass } = (await maintenanceResponse.json()) as {
          enabled: boolean
          canBypass: boolean
        }

        if (enabled && !canBypass) {
          return NextResponse.rewrite(
            new URL(`/${locale}/maintenance`, request.url),
          )
        }
      }
    } catch (err) {
      console.error("[proxy] maintenance status check failed:", err)
      // Fail open: if the status check is unreachable, allow the request
    }
  }

  if (isProtectedPath(pathname)) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
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
