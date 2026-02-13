import type { MeResult } from "@/server/services/users/get-me"

/**
 * Determine where to redirect a user after login,
 * based on their role, onboarding status, and company/university status.
 */
export function getPostLoginRedirectPath(me: MeResult): string {
  const { user, company, university } = me

  switch (user.role) {
    case "student":
      if (!user.onboardingCompleted) return "/onboarding/student"
      return "/dashboard/student"

    case "company_admin":
      if (!user.onboardingCompleted) {
        return "/onboarding/company"
      }
      if (company?.status === "approved") {
        return "/dashboard/company"
      }
      if (company?.status === "rejected") {
        return "/dashboard/company/rejected"
      }
      return "/dashboard/company/pending"

    case "admin":
      if (!user.onboardingCompleted) {
        return "/onboarding/university"
      }
      if (university?.status === "approved") {
        return "/dashboard/admin"
      }
      if (university?.status === "rejected") {
        return "/dashboard/admin/rejected"
      }
      return "/dashboard/admin/pending"

    case "super_admin":
      return "/dashboard/admin"

    default:
      return "/"
  }
}
