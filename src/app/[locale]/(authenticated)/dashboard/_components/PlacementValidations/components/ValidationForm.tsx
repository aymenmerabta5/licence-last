"use client"

import { CalendarDays, Check, Loader2, X } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

  const formattedStart = hasBothDates
    ? new Date(expectedStartDate!).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null
  const formattedEnd = hasBothDates
    ? new Date(expectedEndDate!).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.2 }}
      className="relative overflow-hidden border border-border/60 bg-background lg:col-span-2"
    >
      {/* Left edge accent for the decision panel */}
      <div className="absolute top-0 start-0 h-full w-[3px] bg-emerald-500/30" />

      <div className="relative p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 pt-0.5">
            <h3 className="font-serif text-lg font-semibold text-heading tracking-tight">
              {t("internshipPeriod")}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("periodFromOffer")}
            </p>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Date display */}
        <div>
          {hasBothDates ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <p className="text-lg font-serif font-medium text-heading">
                {formattedStart}
              </p>

              <div className="hidden sm:block h-8 w-px bg-border/60" />

              <div className="flex items-center gap-2 sm:hidden text-muted-foreground">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  &mdash;
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              <p className="text-lg font-serif font-medium text-heading">
                {formattedEnd}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-4">
              <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                {t("periodNotAvailable")}
              </p>
            </div>
          )}
        </div>

        <Separator className="bg-border/40" />

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onValidate}
            disabled={actionLoading || !hasBothDates}
            className={cn(
              "flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700",
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
            className="flex-1 gap-2 border-destructive/25 text-destructive hover:bg-destructive/[0.04] hover:text-destructive"
          >
            <X className="h-4 w-4" />
            {t("reject")}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
