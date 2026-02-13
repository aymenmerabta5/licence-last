import { headers } from "next/headers"

import { requireRole } from "@/lib/auth-guards"
import { auth } from "@/lib/auth"
import { DashboardClientProvider } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"

interface AuthenticatedContentProps {
  children: React.ReactNode
}

/**
 * Server component that handles auth checks for the authenticated layout.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 */
export async function AuthenticatedContent({ children }: AuthenticatedContentProps) {
  const user = await requireRole(["student", "company_admin", "admin", "super_admin"])

  // Check if current session is impersonated
  const session = await auth.api.getSession({ headers: await headers() })
  const impersonatedBy = (session?.session as { impersonatedBy?: string } | null)?.impersonatedBy ?? null

  return (
    <DashboardClientProvider user={user} impersonatedBy={impersonatedBy}>
      {children}
    </DashboardClientProvider>
  )
}
