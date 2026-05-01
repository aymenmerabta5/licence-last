import { Suspense } from "react"
import { ApplicationsHubController } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/ApplicationsHubController"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export async function ApplicationsPageContent() {
  await requireOnboardedStudent()

  return <ApplicationsHubController />
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationsPageContent />
    </Suspense>
  )
}
