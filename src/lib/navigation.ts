import "server-only"

import { redirect as nextRedirect } from "next/navigation"
import { getLocale } from "next-intl/server"

/**
 * Server-side redirect that automatically prefixes the current locale.
 * Handles the typedRoutes constraint by accepting any string path.
 *
 * Requires `setRequestLocale(locale)` to be called in the [locale] layout
 * so that `getLocale()` resolves without accessing headers() — enabling
 * compatibility with Next.js 16 cacheComponents.
 *
 * @param path - The path to redirect to (without locale prefix), e.g. "/dashboard"
 */
export async function localeRedirect(path: string): Promise<never> {
  const locale = await getLocale()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextRedirect(`/${locale}${path}` as any)
}
