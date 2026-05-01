import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { OfferForm } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

async function CreateOfferPageContent() {
  await requireApprovedCompanyAdmin()
  const t = await getTranslations("dashboard.company.offers.form")

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <div className="h-0.5 bg-primary" />

        <div className="space-y-3">
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
              {t("createTitle")}
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-lg">
              {t("createSubtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl">
        <OfferForm mode="create" />
      </div>
    </div>
  )
}

export default function CreateOfferPage() {
  return (
    <Suspense fallback={null}>
      <CreateOfferPageContent />
    </Suspense>
  )
}
