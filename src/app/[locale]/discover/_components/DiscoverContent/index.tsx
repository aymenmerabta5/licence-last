"use client"

import { useTranslations } from "next-intl"
import { DiscoverCtaSection } from "@/app/[locale]/discover/_components/DiscoverContent/components/DiscoverCtaSection"
import { DiscoverHeroFeaturesSection } from "@/app/[locale]/discover/_components/DiscoverContent/components/DiscoverHeroFeaturesSection"
import { DiscoverMatchingTypesSection } from "@/app/[locale]/discover/_components/DiscoverContent/components/DiscoverMatchingTypesSection"

export function DiscoverContent() {
  const t = useTranslations("pages.discover")

  return (
    <>
      <DiscoverHeroFeaturesSection t={t} />
      <DiscoverMatchingTypesSection t={t} />
      <DiscoverCtaSection t={t} />
    </>
  )
}
