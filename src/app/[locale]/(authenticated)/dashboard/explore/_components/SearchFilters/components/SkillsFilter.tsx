"use client"

import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import { FilterSection } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/FilterSection"
import { SkillCheckbox } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/SkillCheckbox"
import type { SkillOption } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/types"
import { Input } from "@/components/ui/input"

interface SkillsFilterProps {
  skills: SkillOption[]
  selectedIds: string[]
  onToggle: (id: string) => void
  t: (key: string) => string
}

export function SkillsFilter({
  skills,
  selectedIds,
  onToggle,
  t,
}: SkillsFilterProps) {
  const [query, setQuery] = useState("")
  const lowerQuery = query.toLowerCase()

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filtered = useMemo(() => {
    const matched = lowerQuery
      ? skills.filter((skill) => skill.name.toLowerCase().includes(lowerQuery))
      : skills

    const selected = matched.filter((skill) => selectedSet.has(skill.id))
    const unselected = matched.filter((skill) => !selectedSet.has(skill.id))

    const categorized = unselected.reduce<Record<string, typeof skills>>(
      (acc, skill) => {
        const category = skill.category ?? "Other"
        const categorySkills = acc[category] ?? []
        categorySkills.push(skill)
        acc[category] = categorySkills
        return acc
      },
      {},
    )

    return { selected, categorized }
  }, [skills, lowerQuery, selectedSet])

  const totalResults =
    filtered.selected.length +
    Object.values(filtered.categorized).reduce(
      (sum, categorySkills) => sum + categorySkills.length,
      0,
    )

  return (
    <FilterSection label={t("skills")} count={selectedIds.length}>
      <div className="relative">
        <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("skillsPlaceholder")}
          className="rounded-none border-foreground/10 bg-transparent h-8 text-xs ps-8 pe-8 placeholder:text-muted-foreground/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-56 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filtered.selected.length > 0 && (
          <div className="space-y-1">
            {filtered.selected.map((skill) => (
              <SkillCheckbox
                key={skill.id}
                skill={skill}
                checked
                onToggle={onToggle}
              />
            ))}
          </div>
        )}

        {filtered.selected.length > 0 &&
          Object.keys(filtered.categorized).length > 0 && (
            <div className="border-t border-foreground/5" />
          )}

        {Object.entries(filtered.categorized).map(
          ([category, categorySkills]) => (
            <div key={category} className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal sticky top-0 bg-background py-0.5">
                {category}
              </p>
              {categorySkills.map((skill) => (
                <SkillCheckbox
                  key={skill.id}
                  skill={skill}
                  checked={false}
                  onToggle={onToggle}
                />
              ))}
            </div>
          ),
        )}

        {totalResults === 0 && query && (
          <p className="text-xs text-muted-foreground/40 text-center py-3">
            No skills match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </FilterSection>
  )
}
