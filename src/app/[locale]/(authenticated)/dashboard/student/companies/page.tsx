import { CompaniesDirectoryView } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"

export default async function StudentCompaniesPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <CompaniesDirectoryView />
}
