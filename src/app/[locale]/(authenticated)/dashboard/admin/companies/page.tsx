import { requireRole } from "@/lib/auth-guards"
import { CompanyValidationList } from "./_components/CompanyValidationList"

export default async function CompanyValidationPage() {
  await requireRole(["super_admin"])
  return <CompanyValidationList />
}
