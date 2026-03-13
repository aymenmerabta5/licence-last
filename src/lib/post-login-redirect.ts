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
      return "/dashboard"

    case "company_admin":
      if (!user.onboardingCompleted) {
        return "/onboarding/company"
      }
      if (company?.status === "approved") {
        return "/dashboard"
      }
      if (company?.status === "rejected") {
        return "/status/company/rejected"
      }
      if (company?.status === "suspended") {
        return "/status/company/suspended"
      }
      return "/status/company/pending"

    case "university_admin":
      if (!user.onboardingCompleted) {
        return "/onboarding/university"
      }
      if (university?.status === "approved") {
        return "/dashboard"
      }
      if (university?.status === "rejected") {
        return "/status/university/rejected"
      }
      return "/status/university/pending"

    case "dept_head":
      return "/dashboard"

    case "super_admin":
      return "/dashboard"

    default:
      return "/"
  }
}
