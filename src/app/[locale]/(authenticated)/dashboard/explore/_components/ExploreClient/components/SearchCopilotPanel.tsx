import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Sparkles, MapPin, Briefcase, Laptop, Tag, Search } from "lucide-react"

import { reveal, ease } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getWilayaName } from "@/lib/wilayas"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"

import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/hooks/useOfferSearch"

interface Skill {
  id: string
  name: string
  category: string | null
}

type AiSuggestion = FilterState & {
  keyword?: string
  explanation?: string | null
}

const WORK_MODE_LABELS: Record<string, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
}

interface SearchCopilotPanelProps {
  aiQuery: string
  onAiQueryChange: (value: string) => void
  aiStatus: string
  aiError: Error | undefined
  aiSuggestion: AiSuggestion | null
  skills: Skill[]
  onParseFilters: (
    query: string,
    skills: { id: string; name: string; category: string | null }[],
  ) => void
}

export function SearchCopilotPanel({
  aiQuery,
  onAiQueryChange,
  aiStatus,
  aiError,
  aiSuggestion,
  skills,
  onParseFilters,
}: SearchCopilotPanelProps) {
  const t = useTranslations("dashboard.explore")

  const isThinking = aiStatus === "streaming" || aiStatus === "submitted"
  const skillMap = new Map(skills.map((s) => [s.id, s.name]))

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
                aiStatus === "ready"
                  ? "bg-emerald-500"
                  : isThinking
                    ? "bg-amber-500 animate-pulse"
                    : "bg-muted-foreground/30"
              }`}
            />
            <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium [[dir=rtl]_&]:tracking-normal">
              {aiStatus === "ready" ? "Ready" : isThinking ? "Thinking..." : aiStatus}
            </span>
          </div>
        </div>

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Input
              value={aiQuery}
              onChange={(e) => onAiQueryChange(e.target.value)}
              placeholder={t("copilot.placeholder")}
              className="rounded-none border-foreground/10 bg-transparent h-9 text-sm placeholder:text-muted-foreground/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && aiStatus === "ready" && aiQuery.trim().length > 0) {
                  onParseFilters(
                    aiQuery,
                    skills.map((s) => ({ id: s.id, name: s.name, category: s.category ?? null })),
                  )
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="editorial"
            size="editorial-sm"
            className="gap-1.5 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            disabled={aiStatus !== "ready" || aiQuery.trim().length === 0}
            onClick={() =>
              onParseFilters(
                aiQuery,
                skills.map((s) => ({ id: s.id, name: s.name, category: s.category ?? null })),
              )
            }
          >
            <Sparkles className="h-3 w-3" />
            {t("copilot.parseFilters")}
          </Button>
        </div>

        {/* Error */}
        {aiError && (
          <p className="text-[11px] text-destructive font-medium">{aiError.message}</p>
        )}

        {/* Suggestion display — human-readable chips instead of raw JSON */}
        {aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
            className="border-t border-border/40 pt-4 space-y-3"
          >
            {/* Explanation */}
            {aiSuggestion.explanation && (
              <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
                &ldquo;{aiSuggestion.explanation}&rdquo;
              </p>
            )}

            {/* Parsed filter chips */}
            <div className="flex flex-wrap gap-2">
              {aiSuggestion.keyword && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-heading [[dir=rtl]_&]:tracking-normal">
                  <Search className="h-3 w-3 text-muted-foreground/50" />
                  {aiSuggestion.keyword}
                </span>
              )}
              {aiSuggestion.wilayaCode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-blue-500/5 border border-blue-500/20 text-blue-700 dark:text-blue-400 [[dir=rtl]_&]:tracking-normal">
                  <MapPin className="h-3 w-3" />
                  {getWilayaName(aiSuggestion.wilayaCode) ?? String(aiSuggestion.wilayaCode).padStart(2, "0")}
                </span>
              )}
              {aiSuggestion.internshipTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-purple-500/5 border border-purple-500/20 text-purple-700 dark:text-purple-400 [[dir=rtl]_&]:tracking-normal"
                >
                  <Briefcase className="h-3 w-3" />
                  {INTERNSHIP_TYPE_LABELS[type] ?? type}
                </span>
              ))}
              {aiSuggestion.workModes.map((mode) => (
                <span
                  key={mode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 [[dir=rtl]_&]:tracking-normal"
                >
                  <Laptop className="h-3 w-3" />
                  {WORK_MODE_LABELS[mode] ?? mode}
                </span>
              ))}
              {aiSuggestion.skillTagIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-400 [[dir=rtl]_&]:tracking-normal"
                >
                  <Tag className="h-3 w-3" />
                  {skillMap.get(id) ?? id}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
