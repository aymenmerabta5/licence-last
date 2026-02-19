import { getTranslations } from "next-intl/server"

import { CandidatesPipelinePage } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"

export default async function CandidatesPage() {
  const user = await requireRole(["company_admin"])
  const company = await getCompanyByUserId(user.id)

  if (!company) {
    return localeRedirect("/dashboard/company/profile")
  }

  const [t, offers] = await Promise.all([
    getTranslations("dashboard"),
    listOffersByCompany(company.id),
  ])

  return <CandidatesPipelinePage offers={offers} t={t} />
}
