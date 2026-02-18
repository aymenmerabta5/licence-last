import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"

import { SavedOffersView } from "@/app/[locale]/(authenticated)/dashboard/student/saved-offers/_components/SavedOffersView"

export default async function SavedOffersPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <SavedOffersView />
}
