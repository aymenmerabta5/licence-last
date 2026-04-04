import { Suspense } from "react"
import { SavedOffersView } from "@/app/[locale]/(authenticated)/dashboard/student/saved-offers/_components/SavedOffersView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"

async function SavedOffersPageContent() {
  await requireOnboardedStudent()

  if (!isFeatureEnabled("SAVED_OFFERS")) {
    return localeRedirect("/dashboard/explore")
  }

  return <SavedOffersView />
}

export default function SavedOffersPage() {
  return (
    <Suspense fallback={null}>
      <SavedOffersPageContent />
    </Suspense>
  )
}
