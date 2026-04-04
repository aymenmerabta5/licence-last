import { Suspense } from "react"
import { CompaniesDirectoryView } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

async function StudentCompaniesPageContent() {
  await requireOnboardedStudent()

  return <CompaniesDirectoryView />
}

export default function StudentCompaniesPage() {
  return (
    <Suspense fallback={null}>
      <StudentCompaniesPageContent />
    </Suspense>
  )
}
