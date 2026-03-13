"use client"

import { Loader2, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import type { ValidationSummary } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

interface AISummaryPanelProps {
  aiSummary: ValidationSummary | null
  isSummarizing: boolean
  summaryError: Error | null
  onGenerate: () => void
}

export function AISummaryPanel({
  aiSummary,
  isSummarizing,
  summaryError,
  onGenerate,
}: AISummaryPanelProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.18 }}
      className="space-y-4 border border-border p-6 lg:col-span-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 font-serif text-lg text-heading">
            <Sparkles className="h-4 w-4" />
            {t("ai.title")}
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            {t("ai.description")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={isSummarizing}
          onClick={onGenerate}
        >
          {isSummarizing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {t("ai.generate")}
        </Button>
      </div>

      {summaryError && (
        <p className="text-xs text-destructive">{summaryError.message}</p>
      )}

      {aiSummary ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("ai.summary")}
            </p>
            <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
              {aiSummary.summaryBullets.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("ai.checklist")}
              </p>
              {aiSummary.checklist.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t("ai.noMissingItems")}
                </p>
              ) : (
                <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                  {aiSummary.checklist.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {aiSummary.potentialInconsistencies.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("ai.potentialInconsistencies")}
                </p>
                <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                  {aiSummary.potentialInconsistencies.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {isSummarizing ? t("ai.generating") : t("ai.hint")}
        </p>
      )}
    </motion.div>
  )
}
