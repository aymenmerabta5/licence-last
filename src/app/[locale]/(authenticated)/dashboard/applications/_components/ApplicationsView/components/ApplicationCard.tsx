"use client"

import { Building2, Loader2, MapPin, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { STATUS_COLORS } from "@/lib/constants/pipeline"

interface ApplicationCardProps {
  app: {
    id: string
    offerId: string
    offerTitle: string
    companyName: string
    offerWilayaCode: number | null
    status: string
    createdAt: string | Date
  }
  isWithdrawing: boolean
  onWithdraw: () => void
  onViewTimeline: () => void
}

export function ApplicationCard({
  app,
  isWithdrawing,
  onWithdraw,
  onViewTimeline,
}: ApplicationCardProps) {
  const t = useTranslations("dashboard.applications")
  const locale = useLocale()

  return (
    <article className="border border-border bg-background p-3 space-y-2">
      <Link
        href={`/dashboard/explore/${app.offerId}` as "/dashboard"}
        className="hover:text-primary transition-colors"
      >
        <h3 className="font-serif text-sm text-heading leading-tight">
          {app.offerTitle}
        </h3>
      </Link>

      <div className="text-[11px] text-muted-foreground space-y-1">
        <p className="inline-flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {app.companyName}
        </p>
        {app.offerWilayaCode && (
          <p className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {String(app.offerWilayaCode).padStart(2, "0")}
          </p>
        )}
      </div>

      <span
        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[app.status] ?? ""}`}
      >
        {t(`status.${app.status}` as "status.applied")}
      </span>

      <p className="text-[10px] text-muted-foreground">
        {t("appliedOn")} {new Date(app.createdAt).toLocaleDateString(locale)}
      </p>

      <div className="flex items-center justify-between gap-2">
        {app.status === "applied" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onWithdraw}
            disabled={isWithdrawing}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1"
          >
            {isWithdrawing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {t("withdraw")}
          </Button>
        ) : (
          <span />
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px]"
          onClick={onViewTimeline}
        >
          Timeline
        </Button>
      </div>
    </article>
  )
}
