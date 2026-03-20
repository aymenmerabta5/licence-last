import { headers } from "next/headers"
import { ImpersonationBanner } from "@/components/ImpersonationBanner"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/auth-guards"

interface StatusContentProps {
  children: React.ReactNode
}

/**
 * Server component auth guard for status pages.
 * Only company_admin and university_admin can view status pages.
 */
export async function StatusContent({ children }: StatusContentProps) {
  const user = await requireRole(["company_admin", "university_admin"], {
    allowUnapproved: true,
  })
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
