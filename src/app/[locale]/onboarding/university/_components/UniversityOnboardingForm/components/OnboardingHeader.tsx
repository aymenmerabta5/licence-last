"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ease, reveal } from "@/lib/animations"

export function OnboardingHeader() {
  const t = useTranslations("onboarding.university")

  return (
    <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
      <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        {t("title")}
      </h1>
      <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        {t("subtitle")}
      </p>
    </motion.div>
  )
}
