import { CompanyTeamView } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { getCompanyMembership } from "@/server/services/companies/membership"

export default async function CompanyTeamPage() {
  const user = await requireRole(["company_admin"])
  const [company, membership] = await Promise.all([
    getCompanyByUserId(user.id),
    getCompanyMembership(user.id),
  ])

  if (!company || company.status !== "approved") {
    return localeRedirect("/status/company/pending")
  }

  if (membership?.role !== "owner") {
    return localeRedirect("/dashboard/company")
  }

  return <CompanyTeamView currentUserId={user.id} />
}
