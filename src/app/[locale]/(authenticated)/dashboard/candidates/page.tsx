import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { CandidatesPipelinePage } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"
import { localeRedirect } from "@/lib/navigation"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"

async function CandidatesPageContent() {
  const { company } = await requireApprovedCompanyAdmin()

  if (!company) {
    return localeRedirect("/dashboard/company/profile")
  }

  const [t, offers] = await Promise.all([
    getTranslations("dashboard"),
    listOffersByCompany(company.id),
  ])

  return <CandidatesPipelinePage offers={offers} t={t} />
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={null}>
      <CandidatesPageContent />
    </Suspense>
  )
}
