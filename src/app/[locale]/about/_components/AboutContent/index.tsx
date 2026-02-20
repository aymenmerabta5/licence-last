"use client"

import { useTranslations } from "next-intl"
import { AboutCtaSection } from "@/app/[locale]/about/_components/AboutContent/components/AboutCtaSection"
import { AboutHeroMissionSection } from "@/app/[locale]/about/_components/AboutContent/components/AboutHeroMissionSection"
import { AboutValuesStatsSection } from "@/app/[locale]/about/_components/AboutContent/components/AboutValuesStatsSection"

export function AboutContent() {
  const t = useTranslations("pages.about")

  return (
    <>
      <AboutHeroMissionSection t={t} />
      <AboutValuesStatsSection t={t} />
      <AboutCtaSection t={t} />
    </>
  )
}
