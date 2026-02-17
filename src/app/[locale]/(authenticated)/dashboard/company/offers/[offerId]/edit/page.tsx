import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { getOfferById } from "@/server/services/offers/get"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { OfferForm } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm"

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>
}) {
  const sessionUser = await requireRole(["company_admin"])
  const { offerId } = await params

  const offer = await getOfferById(offerId)

  if (!offer) {
    return localeRedirect("/dashboard/company/offers")
  }

  // Verify ownership
  const company = await getCompanyByUserId(sessionUser.id)
  if (!company || offer.companyId !== company.id) {
    return localeRedirect("/dashboard/company/offers")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <OfferForm
        mode="edit"
        initialData={{
          offerId: offer.id,
          title: offer.title,
          description: offer.description,
          internshipType: offer.internshipType,
          workMode: offer.workMode,
          wilayaCode: offer.wilayaCode,
          durationWeeks: offer.durationWeeks,
          maxPositions: offer.maxPositions,
          skillTagIds: offer.skills.map((s) => s.id),
        }}
      />
    </div>
  )
}
