import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getPostLoginRedirectPath } from "@/lib/post-login-redirect"
import { getFreshAuthSession } from "@/server/auth/get-fresh-session"
import { getMe } from "@/server/services/users/get-me"

interface AuthRedirectProps {
  locale: string
}

/**
 * Server component that checks for active session and redirects authenticated users.
 * This is separated from the main page to support Next.js 16 cacheComponents.
 * The component is wrapped in Suspense to allow static rendering of the shell.
 */
export async function AuthRedirect({ locale }: AuthRedirectProps) {
  const headersList = await headers()
  const session = await getFreshAuthSession(headersList)

  if (session) {
    if (session.user.banned) {
      return null
    }

    const me = await getMe({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
      onboardingCompleted: session.user.onboardingCompleted,
    })

    const redirectPath = getPostLoginRedirectPath(me)
    redirect(`/${locale}${redirectPath === "/" ? "/dashboard" : redirectPath}`)
  }

  return null
}
