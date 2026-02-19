"use client"

import { useTranslations } from "next-intl"
import { DetailsCapacityFields } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/DetailsCapacityFields"
import { DetailsTimelineFields } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/DetailsTimelineFields"
import { DetailsTypeLocationFields } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/DetailsTypeLocationFields"
import { FormSection } from "@/components/form-fields"

interface DetailsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function DetailsSection({ form }: DetailsSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
    <FormSection title={t("details")} delay={0.15}>
      <div className="grid gap-5 sm:grid-cols-2">
        <DetailsTypeLocationFields form={form} />
        <DetailsCapacityFields form={form} />
        <DetailsTimelineFields form={form} />
      </div>
    </FormSection>
  )
}
