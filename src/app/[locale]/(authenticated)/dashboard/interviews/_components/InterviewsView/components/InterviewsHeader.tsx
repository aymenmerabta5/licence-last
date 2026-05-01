"use client"

import { CalendarCheck, CalendarClock, CalendarDays } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

interface InterviewsHeaderProps {
  role: InterviewsRole
  counts?: {
    total: number
    pending: number
    confirmed: number
  }
}

export function InterviewsHeader({ role, counts }: InterviewsHeaderProps) {
  const t = useTranslations("dashboard.interviews")

  return (
    <header className="space-y-6">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-4">
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-2"
        >
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="max-w-lg text-sm font-light text-muted-foreground">
            {role === "company_admin"
              ? t("subtitleCompany")
              : t("subtitleStudent")}
          </p>
        </motion.div>

        {counts && counts.total > 0 && (
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.15)}
            className="flex items-center gap-6 pt-2"
          >
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-serif text-xl text-heading">
                {counts.total}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {t("totalCountLabel")}
              </span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2 text-sm">
              <CalendarClock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <span className="font-serif text-xl text-heading">
                {counts.pending}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {t("pendingCountLabel")}
              </span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2 text-sm">
              <CalendarCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span className="font-serif text-xl text-heading">
                {counts.confirmed}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {t("confirmedCountLabel")}
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.2)}
          className="flex items-center gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{t("timezoneNote")}</span>
        </motion.div>
      </div>
    </header>
  )
}
