import { CompanyDocumentsView } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"

export default async function CompanyDocumentsPage() {
  const user = await requireRole(["company_admin"])
  const company = await getCompanyByUserId(user.id)

  if (!company || company.status !== "approved") {
    return localeRedirect("/status/company/pending")
  }

  return <CompanyDocumentsView />
}
