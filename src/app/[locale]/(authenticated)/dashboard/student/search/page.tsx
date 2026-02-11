import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { ExploreClient } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"

export default async function StudentSearchPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <ExploreClient />
}
