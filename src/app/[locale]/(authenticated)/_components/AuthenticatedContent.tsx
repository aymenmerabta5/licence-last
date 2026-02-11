import { requireRole } from "@/lib/auth-guards"
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

  return (
    <DashboardClientProvider user={user}>
      {children}
    </DashboardClientProvider>
  )
}
