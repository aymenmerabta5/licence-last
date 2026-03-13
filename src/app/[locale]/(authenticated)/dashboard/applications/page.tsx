import { ApplicationsView } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export default async function ApplicationsPage() {
  await requireOnboardedStudent()

  return <ApplicationsView />
}
