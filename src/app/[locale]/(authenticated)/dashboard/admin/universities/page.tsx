import { UniversityValidationList } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList"
import { requireRole } from "@/lib/auth-guards"

export default async function UniversityValidationPage() {
  await requireRole(["super_admin"])
  return <UniversityValidationList />
}
