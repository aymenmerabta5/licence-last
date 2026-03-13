import { CompanyTeamView } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView"
import { requireCompanyOwner } from "@/lib/dashboard-access"

export default async function CompanyTeamPage() {
  const { user } = await requireCompanyOwner()

  return <CompanyTeamView currentUserId={user.id} />
}
