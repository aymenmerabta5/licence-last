import { CompaniesDirectoryView } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export default async function StudentCompaniesPage() {
  await requireOnboardedStudent()

  return <CompaniesDirectoryView />
}
