import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"
import { WORK_MODES } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/constants"
import { FilterSection } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/FilterSection"
import { toggleMultiValueFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/utils"

interface WorkModeFilterProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  t: (key: string) => string
}

export function WorkModeFilter({ filters, onFiltersChange, t }: WorkModeFilterProps) {
  return (
    <FilterSection label={t("workMode")}>
      <div className="space-y-2.5">
        {WORK_MODES.map((workMode) => {
          const isActive = filters.workModes.includes(workMode)

          return (
            <label
              key={workMode}
              className={cn(
                "flex items-center gap-2.5 cursor-pointer py-1 px-2 -mx-2 transition-colors",
                isActive && "bg-primary/[0.03]",
              )}
            >
              <Checkbox
                checked={isActive}
                onCheckedChange={() =>
                  toggleMultiValueFilter(
                    filters,
                    onFiltersChange,
                    "workModes",
                    workMode,
                  )
                }
              />
              <span className="text-sm">
                {t(`workModeLabel.${workMode}` as "workModeLabel.on_site")}
              </span>
            </label>
          )
        })}
      </div>
    </FilterSection>
  )
}
