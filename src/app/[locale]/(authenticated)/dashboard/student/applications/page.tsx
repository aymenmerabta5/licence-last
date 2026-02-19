import { ApplicationsView } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"

export default async function StudentApplicationsPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <ApplicationsView />
}
