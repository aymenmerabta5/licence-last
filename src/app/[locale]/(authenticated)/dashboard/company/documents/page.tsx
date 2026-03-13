import { CompanyDocumentsView } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

export default async function CompanyDocumentsPage() {
  await requireApprovedCompanyAdmin()

  return <CompanyDocumentsView />
}
