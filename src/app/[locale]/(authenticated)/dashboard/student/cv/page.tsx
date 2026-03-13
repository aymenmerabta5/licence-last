import { StudentCvView } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView"
import { requireOnboardedStudent } from "@/lib/dashboard-access"

export default async function StudentCvPage() {
  await requireOnboardedStudent()

  return <StudentCvView />
}
