import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"
import { FilterSection } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/FilterSection"
import {
  INTERNSHIP_TYPES,
  TYPE_DOT,
} from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/constants"
import { toggleMultiValueFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { INTERNSHIP_TYPE_COLORS } from "@/lib/constants/internship"
import { cn } from "@/lib/utils"

interface InternshipTypeFilterProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  t: (key: string) => string
}

export function InternshipTypeFilter({
  filters,
  onFiltersChange,
  t,
}: InternshipTypeFilterProps) {
  return (
    <FilterSection label={t("internshipType")}>
      <div className="space-y-2.5">
        {INTERNSHIP_TYPES.map((internshipType) => {
          const isActive = filters.internshipTypes.includes(internshipType)

          return (
            <label
              key={internshipType}
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
                    "internshipTypes",
                    internshipType,
                  )
                }
              />
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  TYPE_DOT[internshipType],
                )}
              />
              <span className="text-sm">
                {t(`type.${internshipType}` as "type.pfe")}
              </span>
              {isActive && (
                <span
                  className={cn(
                    "ms-auto text-[9px] font-bold px-1.5 py-0.5 border",
                    INTERNSHIP_TYPE_COLORS[internshipType],
                  )}
                >
                  ON
                </span>
              )}
            </label>
          )
        })}
      </div>
    </FilterSection>
  )
}
