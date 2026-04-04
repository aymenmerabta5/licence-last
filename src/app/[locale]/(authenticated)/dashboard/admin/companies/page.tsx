import { Suspense } from "react"
import { CompanyValidationList } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList"
import { requireRole } from "@/lib/auth-guards"

async function CompanyValidationPageContent() {
  await requireRole(["super_admin"])

  return <CompanyValidationList />
}

export default function CompanyValidationPage() {
  return (
    <Suspense fallback={null}>
      <CompanyValidationPageContent />
    </Suspense>
  )
}
