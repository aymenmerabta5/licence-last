import { Suspense } from "react"
import { ExploreClient } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export async function ExplorePageContent() {
  await requireOnboardedStudent()

  return <ExploreClient />
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExplorePageContent />
    </Suspense>
  )
}
