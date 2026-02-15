"use client"

import { useTranslations } from "next-intl"
import {
  Sparkles,
  Wand2,
  Tag,
  CheckCircle2,
  MapPin,
  Briefcase,
  Laptop,
  Clock,
  Users,
} from "lucide-react"
import * as motion from "motion/react-client"

import { reveal, ease } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getWilayaName } from "@/lib/wilayas"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"

import type { OfferCopilotIntent, CopilotResult } from "../types"

interface SkillTag {
  id: string
  name: string
  category: string | null
}

const WORK_MODE_LABELS: Record<string, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
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
                isPending
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500"
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
              {activeIntent === "offer_generate_draft" && t("copilot.generating")}
              {activeIntent === "offer_improve_description" && t("copilot.improving")}
              {activeIntent === "offer_suggest_skill_tags" && t("copilot.suggesting")}
            </p>
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-muted/40 rounded w-3/4" />
              <div className="h-3 bg-muted/30 rounded w-1/2" />
              <div className="h-3 bg-muted/20 rounded w-2/3" />
            </div>
          </div>
        )}

        {/* Preview result */}
        {result && !isPending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
            className="border-t border-border/40 pt-4 space-y-3"
          >
            {/* Auto-applied indicator */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold tracking-[0.1em] uppercase [[dir=rtl]_&]:tracking-normal">
                  {t("copilot.appliedToForm")}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[10px]"
                onClick={onApply}
              >
                {t("copilot.applyToForm")}
              </Button>
            </div>

            {/* Draft preview */}
            {result.intent === "offer_generate_draft" && (
              <div className="space-y-3">
                {result.title && (
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 mb-1 [[dir=rtl]_&]:tracking-normal">
                      {t("copilot.previewTitle")}
                    </p>
                    <p className="font-serif text-lg text-heading">
                      {result.title}
                    </p>
                  </div>
                )}
                {result.description && (
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 mb-1 [[dir=rtl]_&]:tracking-normal">
                      {t("copilot.previewDescription")}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {result.description}
                    </p>
                  </div>
                )}

                {/* Detail chips */}
                {(result.internshipType || result.workMode || result.wilayaCode || result.durationWeeks || result.maxPositions) && (
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 mb-2 [[dir=rtl]_&]:tracking-normal">
                      {t("copilot.previewDetails")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.internshipType && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-purple-500/5 border border-purple-500/20 text-purple-700 dark:text-purple-400 [[dir=rtl]_&]:tracking-normal">
                          <Briefcase className="h-3 w-3" />
                          {INTERNSHIP_TYPE_LABELS[result.internshipType] ?? result.internshipType}
                        </span>
                      )}
                      {result.workMode && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 [[dir=rtl]_&]:tracking-normal">
                          <Laptop className="h-3 w-3" />
                          {WORK_MODE_LABELS[result.workMode] ?? result.workMode}
                        </span>
                      )}
                      {result.wilayaCode && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-blue-500/5 border border-blue-500/20 text-blue-700 dark:text-blue-400 [[dir=rtl]_&]:tracking-normal">
                          <MapPin className="h-3 w-3" />
                          {getWilayaName(result.wilayaCode) ?? String(result.wilayaCode).padStart(2, "0")}
                        </span>
                      )}
                      {result.durationWeeks && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-heading [[dir=rtl]_&]:tracking-normal">
                          <Clock className="h-3 w-3 text-muted-foreground/50" />
                          {t("copilot.duration", { weeks: result.durationWeeks })}
                        </span>
                      )}
                      {result.maxPositions && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-heading [[dir=rtl]_&]:tracking-normal">
                          <Users className="h-3 w-3 text-muted-foreground/50" />
                          {t("copilot.positions", { count: result.maxPositions })}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Skill chips */}
                <SkillChips
                  skillTagIds={result.skillTagIds}
                  skillTagNames={result.skillTagNames}
                  skillMap={skillMap}
                  label={t("copilot.previewSkills")}
                />
              </div>
            )}

            {/* Improve description preview */}
            {result.intent === "offer_improve_description" && result.description && (
              <div>
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 mb-1 [[dir=rtl]_&]:tracking-normal">
                  {t("copilot.previewDescription")}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.description}
                </p>
              </div>
            )}

            {/* Suggest skills preview */}
            {result.intent === "offer_suggest_skill_tags" && (
              <SkillChips
                skillTagIds={result.skillTagIds}
                skillTagNames={result.skillTagNames}
                skillMap={skillMap}
                label={t("copilot.previewSkills")}
              />
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function SkillChips({
  skillTagIds,
  skillTagNames,
  skillMap,
  label,
}: {
  skillTagIds?: string[]
  skillTagNames?: string[]
  skillMap: Map<string, string>
  label: string
}) {
  const hasSkills =
    (skillTagIds && skillTagIds.length > 0) ||
    (skillTagNames && skillTagNames.length > 0)

  if (!hasSkills) return null

  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 mb-2 [[dir=rtl]_&]:tracking-normal">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {skillTagIds?.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-400 [[dir=rtl]_&]:tracking-normal"
          >
            <Tag className="h-3 w-3" />
            {skillMap.get(id) ?? id}
          </span>
        ))}
        {skillTagNames
          ?.filter((name) => {
            // Don't show names that were already resolved to IDs
            const lowerName = name.toLowerCase()
            return !skillTagIds?.some(
              (id) => skillMap.get(id)?.toLowerCase() === lowerName,
            )
          })
          .map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-400 [[dir=rtl]_&]:tracking-normal"
            >
              <Tag className="h-3 w-3" />
              {name}
            </span>
          ))}
      </div>
    </div>
  )
}
