"use client"

import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function AdminStatsHeader() {
  const t = useTranslations("dashboard.admin.statsHeader")
  const locale = useLocale()
  const currentDate = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  return (
    <header className="space-y-3 sm:space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-2.5 sm:space-y-3">
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6"
        >
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(1.85rem,8vw,3rem)] leading-none tracking-tight text-heading">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-[13px] sm:text-sm font-light tracking-wide text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="shrink-0 border-s border-border/40 ps-6 hidden md:block">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {currentDate}
            </span>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
