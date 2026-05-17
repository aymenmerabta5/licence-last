"use client"

import { Calendar } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { PendingInterview } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { Link } from "@/i18n/routing"
import { reveal, revealWithDelay } from "@/lib/animations"

interface PendingInterviewCardProps {
  interview: PendingInterview
}

export function PendingInterviewCard({ interview }: PendingInterviewCardProps) {
  const t = useTranslations("dashboard.student.pendingInterviewCard")

  return (
    <motion.div
      {...reveal}
      transition={revealWithDelay(0.05)}
      className="border border-amber-500/20 bg-amber-500/[0.03] p-5 dark:bg-amber-500/[0.04]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-amber-500/30 bg-amber-500/10">
          <Calendar
            className="h-4 w-4 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">
            {t("title")}
          </p>
          <p className="text-sm text-foreground">
            {t("description", {
              companyName: interview.companyName,
              offerTitle: interview.offerTitle,
            })}
          </p>
          <Link
            href={`/dashboard/interviews/${interview.id}`}
            prefetch={false}
            className="inline-block text-xs font-medium text-primary hover:underline"
          >
            {t("action")} →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
