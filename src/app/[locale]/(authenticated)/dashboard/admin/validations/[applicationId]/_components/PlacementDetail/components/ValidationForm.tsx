"use client"

import { Calendar, Check, Loader2, X } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

interface ValidationFormProps {
  startDate: string
  onStartDateChange: (value: string) => void
  endDate: string
  onEndDateChange: (value: string) => void
  expectedStartDate?: string | null
  expectedEndDate?: string | null
  showOutOfRangeWarning?: boolean
  actionLoading: boolean
  pdfLoading: boolean
  onValidate: () => void
  onOpenReject: () => void
}

export function ValidationForm({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  expectedStartDate,
  expectedEndDate,
  showOutOfRangeWarning,
  actionLoading,
  pdfLoading,
  onValidate,
  onOpenReject,
}: ValidationFormProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.2 }}
      className="lg:col-span-2 border border-primary/30 bg-primary/5 p-6 space-y-6"
    >
      <h2 className="font-serif text-lg text-heading flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {t("setInternshipPeriod")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {t("startDate")} *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {t("endDate")} *
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {(expectedStartDate || expectedEndDate) && (
        <p className="text-xs text-muted-foreground">
          {t("expectedPeriod")}: {expectedStartDate || t("notAvailable")} -{" "}
          {expectedEndDate || t("notAvailable")}
        </p>
      )}

      {showOutOfRangeWarning && (
        <div className="border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          {t("selectedDatesOutsideExpectedRange")}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={onValidate}
          disabled={actionLoading || !startDate || !endDate}
          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
        >
          {actionLoading || pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {pdfLoading ? t("generatingPdf") : t("validateAndGenerate")}
        </Button>
        <Button
          variant="outline"
          onClick={onOpenReject}
          disabled={actionLoading}
          className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
          {t("reject")}
        </Button>
      </div>
    </motion.div>
  )
}
