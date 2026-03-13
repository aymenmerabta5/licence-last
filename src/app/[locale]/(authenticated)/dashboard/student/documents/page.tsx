import { DocumentsView } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export default async function StudentDocumentsPage() {
  await requireOnboardedStudent()

  return <DocumentsView />
}
