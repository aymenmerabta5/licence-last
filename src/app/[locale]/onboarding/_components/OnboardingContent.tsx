import { headers } from "next/headers"
import { ImpersonationBanner } from "@/components/ImpersonationBanner"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/auth-guards"

interface OnboardingContentProps {
  children: React.ReactNode
}

/**
 * Server component that handles auth checks for the onboarding layout.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 */
export async function OnboardingContent({ children }: OnboardingContentProps) {
  const user = await requireRole([
    "company_admin",
    "student",
    "university_admin",
  ])
  const session = await auth.api.getSession({ headers: await headers() })
  const impersonatedBy =
    (session?.session as { impersonatedBy?: string } | null)?.impersonatedBy ??
    null

  return (
    <>
      {impersonatedBy ? (
        <ImpersonationBanner
          className="mb-5"
          userName={user.name ?? user.email}
        />
      ) : null}
      {children}
    </>
  )
}
