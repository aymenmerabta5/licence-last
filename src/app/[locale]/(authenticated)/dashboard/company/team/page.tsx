import { Suspense } from "react"
import { CompanyTeamView } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView"
import { requireCompanyOwner } from "@/lib/dashboard-access"

async function CompanyTeamPageContent() {
  const { user } = await requireCompanyOwner()

  return <CompanyTeamView currentUserId={user.id} />
}

export default function CompanyTeamPage() {
  return (
    <Suspense fallback={null}>
      <CompanyTeamPageContent />
    </Suspense>
  )
}
