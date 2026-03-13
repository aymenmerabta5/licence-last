import { SavedOffersView } from "@/app/[locale]/(authenticated)/dashboard/student/saved-offers/_components/SavedOffersView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"

export default async function SavedOffersPage() {
  await requireOnboardedStudent()

  if (!isFeatureEnabled("SAVED_OFFERS")) {
    return localeRedirect("/dashboard/explore")
  }

  return <SavedOffersView />
}
