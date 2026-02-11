import { requireRole } from "@/lib/auth-guards"

interface OnboardingContentProps {
  children: React.ReactNode
}

/**
 * Server component that handles auth checks for the onboarding layout.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 */
export async function OnboardingContent({ children }: OnboardingContentProps) {
  await requireRole(["company_admin", "student"])

  return <>{children}</>
}
