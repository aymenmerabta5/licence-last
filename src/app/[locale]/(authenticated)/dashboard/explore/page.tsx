import { ExploreClient } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export default async function ExplorePage() {
  await requireOnboardedStudent()

  return <ExploreClient />
}
