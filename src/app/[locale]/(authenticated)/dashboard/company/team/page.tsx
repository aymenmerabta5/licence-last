import { Suspense } from "react"
import { TeamPageSkeleton } from "@/app/[locale]/(authenticated)/dashboard/_components/DashboardPageSkeletons"
import { CompanyTeamView } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView"
import { requireCompanyOwner } from "@/lib/dashboard-access"

async function CompanyTeamPageContent() {
  const { user } = await requireCompanyOwner()

  return <CompanyTeamView currentUserId={user.id} />
}

export default function CompanyTeamPage() {
  return (
    <Suspense fallback={<TeamPageSkeleton />}>
      <CompanyTeamPageContent />
    </Suspense>
  )
}
