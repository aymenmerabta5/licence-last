import { getTranslations } from "next-intl/server"

import { CandidatesPipelinePage } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyMembership } from "@/server/services/companies/membership"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"

export default async function CandidatesPage() {
  const { user } = await requireApprovedCompanyAdmin()
  const membership = await getCompanyMembership(user.id)

  if (!membership) {
    return localeRedirect("/dashboard/company/profile")
  }

  const [t, offers] = await Promise.all([
    getTranslations("dashboard"),
    listOffersByCompany(membership.companyId),
  ])

  return <CandidatesPipelinePage offers={offers} t={t} />
}
