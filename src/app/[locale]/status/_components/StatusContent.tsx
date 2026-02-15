import { requireRole } from "@/lib/auth-guards"

interface StatusContentProps {
  children: React.ReactNode
}

/**
 * Server component auth guard for status pages.
 * Only company_admin and university_admin can view status pages.
 */
export async function StatusContent({ children }: StatusContentProps) {
  await requireRole(["company_admin", "university_admin"], { allowUnapproved: true })

  return <>{children}</>
}
