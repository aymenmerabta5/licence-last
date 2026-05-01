"use client"

import { SlidersHorizontal, X } from "lucide-react"

import { LanguagesFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/LanguagesFilter"
import { SkillsFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/SkillsFilter"
import { Button } from "@/components/ui/button"

interface CandidatesFiltersProps {
  skills: Array<{ id: string; name: string; category: string | null }>
  skillTagIds: string[]
  languageCodes: string[]
  onToggleSkill: (skillTagId: string) => void
  onToggleLanguage: (languageCode: string) => void
  onClear: () => void
  hasActiveFilters: boolean
  tExplore: (key: string) => string
}

export function CandidatesFilters({
  skills,
  skillTagIds,
  languageCodes,
  onToggleSkill,
  onToggleLanguage,
  onClear,
  hasActiveFilters,
  tExplore,
}: CandidatesFiltersProps) {
  return (
    <div className="border border-border/50 bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground/50" />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
            {tExplore("filters")}
          </h2>
        </div>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none text-[10px] font-bold uppercase tracking-[0.15em] gap-1.5 text-muted-foreground/70 hover:text-destructive [[dir=rtl]_&]:tracking-normal"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
            {tExplore("clearFilters")}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <SkillsFilter
          skills={skills}
          selectedIds={skillTagIds}
          onToggle={onToggleSkill}
          t={tExplore}
        />
        <LanguagesFilter
          selectedCodes={languageCodes}
          onToggle={onToggleLanguage}
          t={tExplore}
        />
      </div>
    </div>
  )
}
