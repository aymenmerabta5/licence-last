import { Suspense } from "react"
import { ApplicationsView } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export async function ApplicationsPageContent() {
  await requireOnboardedStudent()

  return <ApplicationsView />
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationsPageContent />
    </Suspense>
  )
}
