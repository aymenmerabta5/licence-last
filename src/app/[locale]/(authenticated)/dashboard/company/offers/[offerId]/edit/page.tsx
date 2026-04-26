import { Suspense } from "react"
import { OfferForm } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm"
import type { LanguageCode } from "@/lib/constants/languages"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"
import { localeRedirect } from "@/lib/navigation"
import { getOfferById } from "@/server/services/offers/get"

async function EditOfferPageContent({
  params,
}: {
  params: Promise<{ offerId: string }>
}) {
  const { company } = await requireApprovedCompanyAdmin()
  const { offerId } = await params

  const offer = await getOfferById(offerId)

  if (!offer) {
    return localeRedirect("/dashboard/company/offers")
  }

  // Verify ownership
  if (offer.companyId !== company.id) {
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
          applicationDeadlineAt: offer.applicationDeadlineAt,
          expectedStartDate: offer.expectedStartDate,
          expectedEndDate: offer.expectedEndDate,
          skillTagIds: offer.skills.map((s) => s.id),
          languageRequirements: (offer.languageRequirements ?? []).map(
            (entry) => ({
              languageCode: entry.languageCode as LanguageCode,
              minimumProficiency: entry.minimumProficiency,
              isRequired: entry.isRequired,
              weight: entry.weight,
            }),
          ),
        }}
      />
    </div>
  )
}

export default function EditOfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>
}) {
  return (
    <Suspense fallback={null}>
      <EditOfferPageContent params={params} />
    </Suspense>
  )
}
