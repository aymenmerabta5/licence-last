"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

interface CompanyValidationHeaderProps {
  total: number
}

export function CompanyValidationHeader({
  total,
}: CompanyValidationHeaderProps) {
  const t = useTranslations("dashboard.admin.companies")

  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
              {t("title")}
            </h1>
            <p className="text-sm font-light tracking-wide text-muted-foreground max-w-2xl">
              {t("description")}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 border-s border-border/40 ps-6">
            <span className="font-serif text-3xl text-heading tracking-tight">
              {total}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Total
            </span>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
