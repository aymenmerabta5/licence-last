import { headers } from "next/headers"
import { DashboardClientProvider } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { getCompanyMembership } from "@/server/services/companies/membership"
import { getUniversityStatusByUserId } from "@/server/services/universities/get-status"

interface AuthenticatedContentProps {
  children: React.ReactNode
}

/**
 * Server component that handles auth checks for the authenticated layout.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 *
 * Also blocks unapproved company_admin / university_admin from the dashboard,
 * redirecting them to the standalone status pages under /(status)/.
 */
export async function AuthenticatedContent({
  children,
}: AuthenticatedContentProps) {
  const user = await requireRole([
    "student",
    "company_admin",
    "university_admin",
    "super_admin",
  ])
  let companyMembershipRole: string | null = null

  // ── Block unapproved company_admin ──
  if (user.role === "company_admin") {
    if (!user.onboardingCompleted) {
      return localeRedirect("/onboarding/company")
    }
    const [company, membership] = await Promise.all([
      getCompanyByUserId(user.id),
      getCompanyMembership(user.id),
    ])
    companyMembershipRole = membership?.role ?? null
    if (!company || company.status === "pending") {
      return localeRedirect("/status/company/pending")
    }
    if (company.status === "rejected") {
      return localeRedirect("/status/company/rejected")
    }
    if (company.status === "suspended") {
      return localeRedirect("/status/company/suspended")
    }
  }

  // ── Block unapproved university-side accounts ──
  if (user.rawRole === "university_admin" || user.role === "university_admin") {
    if (!user.onboardingCompleted) {
      return localeRedirect("/onboarding/university")
    }
    const university = await getUniversityStatusByUserId(user.id)
    if (!university || university.status === "pending") {
      return localeRedirect("/status/university/pending")
    }
    if (university.status === "rejected") {
      return localeRedirect("/status/university/rejected")
    }
  }

  // Check if current session is impersonated
  const session = await auth.api.getSession({ headers: await headers() })
  const impersonatedBy =
    (session?.session as { impersonatedBy?: string } | null)?.impersonatedBy ??
    null

  return (
    <DashboardClientProvider
      user={user}
      impersonatedBy={impersonatedBy}
      companyMembershipRole={companyMembershipRole}
      universityMembershipRole={user.universityMembershipRole ?? null}
      universityDepartmentId={user.universityDepartmentId ?? null}
    >
      {children}
    </DashboardClientProvider>
  )
}
