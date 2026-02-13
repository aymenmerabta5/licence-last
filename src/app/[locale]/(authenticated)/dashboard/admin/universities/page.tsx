import { requireRole } from "@/lib/auth-guards"
import { UniversityValidationList } from "./_components/UniversityValidationList"

export default async function UniversityValidationPage() {
  await requireRole(["super_admin"])
  return <UniversityValidationList />
}
