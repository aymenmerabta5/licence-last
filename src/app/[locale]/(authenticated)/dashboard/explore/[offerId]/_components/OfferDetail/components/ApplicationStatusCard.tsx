"use client"

import { useTranslations } from "next-intl"
import type { OfferApplicationSummary } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { STATUS_COLORS } from "@/lib/constants/pipeline"

interface ApplicationStatusCardProps {
  application: OfferApplicationSummary
}

export function ApplicationStatusCard({
  application,
}: ApplicationStatusCardProps) {
  const t = useTranslations("dashboard.offerDetail")
  const statusT = useTranslations("dashboard.applications.status")

  return (
    <div className="border border-border bg-card p-5 space-y-3">
      <p className="text-sm font-medium text-foreground">
        {t("alreadyApplied")}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {t("applicationStatus")}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${STATUS_COLORS[application.status] ?? ""}`}
        >
          {statusT(application.status as "applied")}
        </span>
      </div>
    </div>
  )
}
