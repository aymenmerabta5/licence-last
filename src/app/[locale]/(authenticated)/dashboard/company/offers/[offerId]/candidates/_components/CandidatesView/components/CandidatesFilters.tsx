"use client"

import { Button } from "@/components/ui/button"
import { LanguagesFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/LanguagesFilter"
import { SkillsFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/SkillsFilter"

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
    <div className="space-y-4 border border-border/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
          {tExplore("filters")}
        </h2>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none text-[10px] font-bold uppercase tracking-[0.15em] [[dir=rtl]_&]:tracking-normal"
            onClick={onClear}
          >
            {tExplore("clearFilters")}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
