"use client"

import { Sparkles, Tag, Wand2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { CopilotResultPreview } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/CopilotResultPreview"
import type {
  CopilotResult,
  OfferCopilotIntent,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ease, reveal } from "@/lib/animations"

interface SkillTag {
  id: string
  name: string
  category: string | null
}

interface CopilotPanelProps {
  aiPrompt: string
  onAiPromptChange: (value: string) => void
  activeIntent: OfferCopilotIntent | null
  isPending: boolean
  error: Error | undefined
  result: CopilotResult | null
  skillTags: SkillTag[]
  onSendIntent: (intent: OfferCopilotIntent) => void
  onApply: () => void
}

export function CopilotPanel({
  aiPrompt,
  onAiPromptChange,
  activeIntent,
  isPending,
  error,
  result,
  skillTags,
  onSendIntent,
  onApply,
}: CopilotPanelProps) {
  const t = useTranslations("dashboard.company.offers.form")

  const skillMap = new Map(skillTags.map((s) => [s.id, s.name]))

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.08 }}
      className="relative"
    >
      {/* Accent left border */}
      <div className="absolute start-0 top-0 bottom-0 w-0.5 bg-primary/40" />

      <div className="border border-border/50 border-s-0 bg-primary/[0.02] dark:bg-primary/[0.04] p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 flex items-center justify-center bg-primary/10">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
                {t("copilot.title")}
              </p>
              <p className="text-[11px] text-muted-foreground/60 font-light mt-0.5">
                {t("copilot.description")}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isPending ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium [[dir=rtl]_&]:tracking-normal">
              {isPending ? t("copilot.thinking") : t("copilot.ready")}
            </span>
          </div>
        </div>

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Input
              value={aiPrompt}
              onChange={(e) => onAiPromptChange(e.target.value)}
              placeholder={t("copilot.promptPlaceholder")}
              className="rounded-none border-foreground/10 bg-transparent h-9 text-sm placeholder:text-muted-foreground/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isPending) {
                  onSendIntent("offer_generate_draft")
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="editorial"
            size="editorial-sm"
            className="gap-1.5 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            disabled={isPending}
            onClick={() => onSendIntent("offer_generate_draft")}
          >
            <Wand2 className="h-3 w-3" />
            {t("copilot.generateDraft")}
          </Button>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={isPending}
            onClick={() => onSendIntent("offer_improve_description")}
          >
            <Sparkles className="h-3 w-3" />
            {t("copilot.improveDescription")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={isPending}
            onClick={() => onSendIntent("offer_suggest_skill_tags")}
          >
            <Tag className="h-3 w-3" />
            {t("copilot.suggestSkills")}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[11px] text-destructive font-medium">
            {error.message}
          </p>
        )}

        {/* Loading state */}
        {isPending && activeIntent && (
          <div className="border-t border-border/40 pt-4 space-y-3">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
              {activeIntent === "offer_generate_draft" &&
                t("copilot.generating")}
              {activeIntent === "offer_improve_description" &&
                t("copilot.improving")}
              {activeIntent === "offer_suggest_skill_tags" &&
                t("copilot.suggesting")}
            </p>
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-muted/40 rounded w-3/4" />
              <div className="h-3 bg-muted/30 rounded w-1/2" />
              <div className="h-3 bg-muted/20 rounded w-2/3" />
            </div>
          </div>
        )}

        {result && !isPending && (
          <CopilotResultPreview
            result={result}
            onApply={onApply}
            skillMap={skillMap}
            t={t}
          />
        )}
      </div>
    </motion.div>
  )
}
