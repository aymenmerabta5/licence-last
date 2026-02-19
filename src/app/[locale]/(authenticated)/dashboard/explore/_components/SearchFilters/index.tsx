"use client"

import type { SearchFiltersProps } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/types"
import { SkillsFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/SkillsFilter"
import { InternshipTypeFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/InternshipTypeFilter"
import { WilayaFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/WilayaFilter"
import { WorkModeFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/WorkModeFilter"
import { toggleMultiValueFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/utils"

export function SearchFilters({
  filters,
  onFiltersChange,
  skills,
  t,
}: SearchFiltersProps) {
  return (
    <div className="space-y-7">
      <WilayaFilter filters={filters} onFiltersChange={onFiltersChange} t={t} />
      <InternshipTypeFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
        t={t}
      />
      <WorkModeFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
        t={t}
      />

      {skills.length > 0 && (
        <SkillsFilter
          skills={skills}
          selectedIds={filters.skillTagIds}
          onToggle={(skillId) =>
            toggleMultiValueFilter(
              filters,
              onFiltersChange,
              "skillTagIds",
              skillId,
            )
          }
          t={t}
        />
      )}
    </div>
  )
}

