"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function CompanyTeamHeader() {
  const t = useTranslations("dashboard.company.team")

  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Badge variant="editorial-muted">{t("kicker")}</Badge>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-2"
        >
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-lg">
            {t("subtitle")}
          </p>
        </motion.div>
      </div>
    </header>
  )
}
