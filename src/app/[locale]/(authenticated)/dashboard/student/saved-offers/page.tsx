import { SavedOffersView } from "@/app/[locale]/(authenticated)/dashboard/student/saved-offers/_components/SavedOffersView"
import { requireRole } from "@/lib/auth-guards"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"

export default async function SavedOffersPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  if (!isFeatureEnabled("SAVED_OFFERS")) {
    return localeRedirect("/dashboard/explore")
  }

  return <SavedOffersView />
}
