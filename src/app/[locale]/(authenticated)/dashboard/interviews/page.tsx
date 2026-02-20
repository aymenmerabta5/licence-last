import { InterviewsView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { requireRole } from "@/lib/auth-guards"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"

export default async function InterviewsPage() {
  const user = await requireRole(["student", "company_admin"])
  if (!isFeatureEnabled("INTERVIEWS")) {
    if (user.role === "company_admin") {
      return localeRedirect("/dashboard/company/offers")
    }
    return localeRedirect("/dashboard/applications")
  }

  const role: InterviewsRole =
    user.role === "company_admin" ? "company_admin" : "student"

  return <InterviewsView role={role} />
}
