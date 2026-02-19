"use client"

import { Loader2, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { AdminValidationSummary } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/types"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

interface AISummaryPanelProps {
  aiSummary: AdminValidationSummary | null
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
      className="lg:col-span-2 border border-border p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-lg text-heading flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t("ai.title")}
          </h2>
          <p className="text-sm text-muted-foreground font-light">
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
          <div className="lg:col-span-2 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("ai.summary")}
            </p>
            <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
              {aiSummary.summaryBullets.map((item, idx) => (
                <li key={idx}>{item}</li>
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
                <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
                  {aiSummary.checklist.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {aiSummary.potentialInconsistencies.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("ai.potentialInconsistencies")}
                </p>
                <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
                  {aiSummary.potentialInconsistencies.map((item, idx) => (
                    <li key={idx}>{item}</li>
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
