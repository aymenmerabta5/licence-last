"use client"

import { useTranslations } from "next-intl"
import { ForStudentsCtaSection } from "@/app/[locale]/for-students/_components/ForStudentsContent/components/ForStudentsCtaSection"
import { ForStudentsHeroBenefitsSection } from "@/app/[locale]/for-students/_components/ForStudentsContent/components/ForStudentsHeroBenefitsSection"
import { ForStudentsJourneySection } from "@/app/[locale]/for-students/_components/ForStudentsContent/components/ForStudentsJourneySection"

export function ForStudentsContent() {
  const t = useTranslations("pages.forStudents")

  return (
    <>
      <ForStudentsHeroBenefitsSection t={t} />
      <ForStudentsJourneySection t={t} />
      <ForStudentsCtaSection t={t} />
    </>
  )
}
