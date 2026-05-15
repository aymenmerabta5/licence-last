"use client"

import { CheckCircle2, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"

interface SkillSearchProps {
  query: string
  onQueryChange: (value: string) => void
  isLoading: boolean
  isAtMax: boolean
  saveError: string
  saveTick: number
}

export function SkillSearch({
  query,
  onQueryChange,
  isLoading,
  isAtMax,
  saveError,
  saveTick,
}: SkillSearchProps) {
  const t = useTranslations("dashboard.settings.skillsManager")

  return (
    <div className="space-y-2.5">
      <Label
        htmlFor="skill-search"
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60"
      >
        {t("findSkills")}
      </Label>
      <div className="relative">
        <InputGroup className="rounded-lg h-11">
          <InputGroupAddon align="inline-start">
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="skill-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            disabled={isLoading}
          />
        </InputGroup>
      </div>

      {/* Status messages */}
      {isAtMax && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          {t("maxReached")}
        </p>
      )}
      {saveError && (
        <p className="text-[11px] text-destructive font-medium" role="alert">
          {saveError}
        </p>
      )}
      {saveTick > 0 && (
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> {t("saveSuccess")}
        </p>
      )}
    </div>
  )
}
