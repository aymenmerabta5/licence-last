import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { ApplicationsView } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView"

export default async function StudentApplicationsPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <ApplicationsView />
}
