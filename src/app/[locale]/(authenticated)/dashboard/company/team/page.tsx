import { CompanyTeamView } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"

export default async function CompanyTeamPage() {
  const user = await requireRole(["company_admin"])
  const company = await getCompanyByUserId(user.id)

  if (!company || company.status !== "approved") {
    return localeRedirect("/status/company/pending")
  }

  return <CompanyTeamView currentUserId={user.id} />
}
