"use client"

import { useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"

import { HeroContent } from "@/app/[locale]/_components/HeroSection/components/HeroContent"
import { HeroFeatures } from "@/app/[locale]/_components/HeroSection/components/HeroFeatures"
import {
  buildHeroFeatures,
  getHeroHeadlineSegments,
} from "@/app/[locale]/_components/HeroSection/utils"

export function HeroSection() {
  const t = useTranslations()
  const prefersReducedMotion = useReducedMotion() ?? false

  const features = buildHeroFeatures(t)
  const headline = getHeroHeadlineSegments(
    t("hero.headline"),
    t("hero.headlineHighlight"),
  )

  return (
    <section id="discover" className="relative px-8 pt-16 pb-20 lg:px-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -start-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 start-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-12">
        <HeroContent
          volumeLabel={t("hero.volume")}
          headline={headline}
          descriptionPrimary={t("hero.description1")}
          descriptionSecondary={t("hero.description2")}
          ctaLabel={t("hero.cta")}
          ctaAriaLabel={t("hero.aria.explore")}
          freeForStudentsLabel={t("hero.freeForStudents")}
          prefersReducedMotion={prefersReducedMotion}
        />
        <HeroFeatures
          features={features}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </section>
  )
}
