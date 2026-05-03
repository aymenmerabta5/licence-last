import { InterviewsView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView"
import { requireRole } from "@/lib/auth-guards"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"

export default async function InterviewsPage() {
  const user = await requireRole(["student", "company_admin"])
  if (user.role === "student") {
    return localeRedirect("/dashboard/applications")
  }
  if (!isFeatureEnabled("INTERVIEWS")) {
    return localeRedirect("/dashboard/company/offers")
  }

  return <InterviewsView role="company_admin" />
}
