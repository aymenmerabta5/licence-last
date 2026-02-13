import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Sparkles } from "lucide-react"

import { reveal, ease } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { FilterState } from "../hooks/useOfferSearch"

interface Skill {
  id: string
  name: string
  category: string | null
}

type AiSuggestion = FilterState & {
  keyword?: string
  explanation?: string | null
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
  onApplySuggestion: (suggestion: AiSuggestion) => void
}

export function SearchCopilotPanel({
  aiQuery,
  onAiQueryChange,
  aiStatus,
  aiError,
  aiSuggestion,
  skills,
  onParseFilters,
  onApplySuggestion,
}: SearchCopilotPanelProps) {
  const t = useTranslations("dashboard.explore")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.08 }}
      className="border border-border bg-primary/5 p-4 rounded-none space-y-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
            {t("copilot.title")}
          </p>
          <p className="text-sm text-muted-foreground font-light">
            {t("copilot.description")}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t("copilot.aiStatus", { status: aiStatus })}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={aiQuery}
          onChange={(e) => onAiQueryChange(e.target.value)}
          placeholder={t("copilot.placeholder")}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={aiStatus !== "ready" || aiQuery.trim().length === 0}
          onClick={() =>
            onParseFilters(
              aiQuery,
              skills.map((s) => ({
                id: s.id,
                name: s.name,
                category: s.category ?? null,
              })),
            )
          }
        >
          <Sparkles className="h-4 w-4" />
          {t("copilot.parseFilters")}
        </Button>
        {aiSuggestion && (
          <Button
            type="button"
            variant="editorial"
            size="editorial"
            className="h-9"
            onClick={() => onApplySuggestion(aiSuggestion)}
          >
            {t("copilot.apply")}
          </Button>
        )}
      </div>

      {aiError && (
        <p className="text-xs text-destructive">{aiError.message}</p>
      )}

      {aiSuggestion && (
        <div className="border border-border bg-background/60 p-3 rounded-none space-y-2">
          {aiSuggestion.explanation && (
            <p className="text-xs text-muted-foreground">
              {aiSuggestion.explanation}
            </p>
          )}
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(aiSuggestion, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  )
}
