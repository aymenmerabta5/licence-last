import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { ApplicationsClient } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsClient"

export default async function StudentApplicationsPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <ApplicationsClient />
}
