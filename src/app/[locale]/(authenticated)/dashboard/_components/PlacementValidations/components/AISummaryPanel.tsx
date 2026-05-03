"use client"

import { Loader2, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import type { ValidationSummary } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface AISummaryPanelProps {
  aiSummary: ValidationSummary | null
  isSummarizing: boolean
  summaryError: Error | null
  onGenerate: () => void
}

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
        {title}
      </p>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-2 text-sm text-muted-foreground leading-relaxed"
        >
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
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
      className="space-y-5 border border-border bg-background p-6 lg:col-span-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-heading">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("ai.title")}
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            {t("ai.description")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 shrink-0 rounded-none"
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
        <div className="border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          {summaryError.message}
        </div>
      )}

      {aiSummary ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title={t("ai.summary")} className="lg:col-span-2">
            <BulletList items={aiSummary.summaryBullets} />
          </Section>

          <div className="space-y-5">
            <Section title={t("ai.checklist")}>
              {aiSummary.checklist.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("ai.noMissingItems")}
                </p>
              ) : (
                <BulletList items={aiSummary.checklist} />
              )}
            </Section>

            {aiSummary.potentialInconsistencies.length > 0 && (
              <Section title={t("ai.potentialInconsistencies")}>
                <BulletList items={aiSummary.potentialInconsistencies} />
              </Section>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isSummarizing && <Loader2 className="h-3 w-3 animate-spin" />}
          <span>{isSummarizing ? t("ai.generating") : t("ai.hint")}</span>
        </div>
      )}
    </motion.div>
  )
}
