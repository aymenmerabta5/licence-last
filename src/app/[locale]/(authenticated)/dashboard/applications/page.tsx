import { ApplicationsHubController } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/ApplicationsHubController"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export default async function ApplicationsPage() {
  await requireOnboardedStudent()

  return <ApplicationsHubController />
}
