"use client"

import { FileText, Loader2, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import type { ValidationSummary } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
    <div className={cn("space-y-3", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
        >
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
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
      className="relative overflow-hidden border border-border/60 bg-background lg:col-span-2"
    >
      {/* Distinctive left edge — analyst notes feel */}
      <div className="absolute top-0 start-0 h-full w-[3px] bg-primary/20" />

      <div className="relative p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary/70" />
              <h2 className="font-serif text-lg font-semibold text-heading tracking-tight">
                {t("ai.title")}
              </h2>
            </div>
            <p className="text-sm font-light leading-relaxed text-muted-foreground max-w-xl">
              {t("ai.description")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2 shrink-0 border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"
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
          <div className="rounded-sm border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {summaryError.message}
          </div>
        )}

        {aiSummary ? (
          <>
            <Separator className="bg-border/40" />
            <div className="grid gap-8 lg:grid-cols-5">
              <Section title={t("ai.summary")} className="lg:col-span-3">
                <div className="rounded-lg bg-muted/25 border border-border/30 p-5">
                  <BulletList items={aiSummary.summaryBullets} />
                </div>
              </Section>

              <div className="space-y-6 lg:col-span-2">
                <Section title={t("ai.checklist")}>
                  {aiSummary.checklist.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/25 border border-border/30 p-4 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 text-primary/50" />
                      {t("ai.noMissingItems")}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-muted/25 border border-border/30 p-5">
                      <BulletList items={aiSummary.checklist} />
                    </div>
                  )}
                </Section>

                {aiSummary.potentialInconsistencies.length > 0 && (
                  <Section title={t("ai.potentialInconsistencies")}>
                    <div className="rounded-lg bg-amber-500/[0.04] border border-amber-500/20 p-5">
                      <BulletList items={aiSummary.potentialInconsistencies} />
                    </div>
                  </Section>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            {isSummarizing && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {isSummarizing ? t("ai.generating") : t("ai.hint")}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
