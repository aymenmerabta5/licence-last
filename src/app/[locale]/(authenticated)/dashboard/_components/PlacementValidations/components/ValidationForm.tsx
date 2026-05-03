"use client"

import { Calendar, Check, Loader2, X } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface ValidationFormProps {
  expectedStartDate?: string | null
  expectedEndDate?: string | null
  actionLoading: boolean
  pdfLoading: boolean
  onValidate: () => void
  onOpenReject: () => void
}

export function ValidationForm({
  expectedStartDate,
  expectedEndDate,
  actionLoading,
  pdfLoading,
  onValidate,
  onOpenReject,
}: ValidationFormProps) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const locale = useLocale()

  const hasBothDates = Boolean(expectedStartDate) && Boolean(expectedEndDate)

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.2 }}
      className="space-y-6 border border-primary/20 bg-primary/[0.02] p-6 lg:col-span-2"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/20 bg-primary/5 text-primary">
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-heading">
            {t("internshipPeriod")}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("periodFromOffer")}
          </p>
        </div>
      </div>

      {/* Date display */}
      <div className="space-y-2">
        {hasBothDates ? (
          <div className="text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {new Date(expectedStartDate!).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" — "}
              {new Date(expectedEndDate!).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        ) : (
          <div className="border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              {t("periodNotAvailable")}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          onClick={onValidate}
          disabled={actionLoading || !hasBothDates}
          className={cn(
            "flex-1 gap-2 rounded-none bg-emerald-600 text-white hover:bg-emerald-700",
            "transition-colors",
          )}
        >
          {actionLoading || pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {pdfLoading ? t("generatingPdf") : t("validatePlacement")}
        </Button>
        <Button
          variant="outline"
          onClick={onOpenReject}
          disabled={actionLoading}
          className="flex-1 gap-2 rounded-none border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
          {t("reject")}
        </Button>
      </div>
    </motion.div>
  )
}
