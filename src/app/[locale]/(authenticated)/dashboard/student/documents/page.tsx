import { Suspense } from "react"
import { DocumentsView } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

async function StudentDocumentsPageContent() {
  await requireOnboardedStudent()

  return <DocumentsView />
}

export default function StudentDocumentsPage() {
  return (
    <Suspense fallback={null}>
      <StudentDocumentsPageContent />
    </Suspense>
  )
}
