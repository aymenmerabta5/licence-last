import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("dashboard.company.offers.form")

  const offer = await getOfferById(offerId)

  if (!offer) {
    return localeRedirect("/dashboard/company/offers")
  }

  // Verify ownership
  if (offer.companyId !== company.id) {
    return localeRedirect("/dashboard/company/offers")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <div className="h-0.5 bg-primary" />

        <div className="space-y-3">
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
              {t("editTitle")}
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-lg">
              {t("editSubtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl">
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
