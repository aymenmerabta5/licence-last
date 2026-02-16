import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { CompanyDocumentsView } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView"

export default async function CompanyDocumentsPage() {
  const user = await requireRole(["company_admin"])
  const company = await getCompanyByUserId(user.id)

  if (!company || company.status !== "approved") {
    return localeRedirect("/status/company/pending")
  }

  return <CompanyDocumentsView />
}
