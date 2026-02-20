"use client"

import { useTranslations } from "next-intl"
import { ForCompaniesCtaSection } from "@/app/[locale]/for-companies/_components/ForCompaniesContent/components/ForCompaniesCtaSection"
import { ForCompaniesHeroBenefitsSection } from "@/app/[locale]/for-companies/_components/ForCompaniesContent/components/ForCompaniesHeroBenefitsSection"
import { ForCompaniesWorkflowStatsSection } from "@/app/[locale]/for-companies/_components/ForCompaniesContent/components/ForCompaniesWorkflowStatsSection"

export function ForCompaniesContent() {
  const t = useTranslations("pages.forCompanies")

  return (
    <>
      <ForCompaniesHeroBenefitsSection t={t} />
      <ForCompaniesWorkflowStatsSection t={t} />
      <ForCompaniesCtaSection t={t} />
    </>
  )
}
