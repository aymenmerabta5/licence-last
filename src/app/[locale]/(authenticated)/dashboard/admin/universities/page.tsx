import { Suspense } from "react"
import { UniversityValidationList } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList"
import { requireRole } from "@/lib/auth-guards"

async function UniversityValidationPageContent() {
  await requireRole(["super_admin"])

  return <UniversityValidationList />
}

export default function UniversityValidationPage() {
  return (
    <Suspense fallback={null}>
      <UniversityValidationPageContent />
    </Suspense>
  )
}
