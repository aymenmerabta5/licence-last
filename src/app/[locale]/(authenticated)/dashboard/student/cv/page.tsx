import { Suspense } from "react"
import { StudentCvView } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

async function StudentCvPageContent() {
  await requireOnboardedStudent()

  return <StudentCvView />
}

export default function StudentCvPage() {
  return (
    <Suspense fallback={null}>
      <StudentCvPageContent />
    </Suspense>
  )
}
