"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { getWilayaName, WILAYA_OPTIONS } from "@/lib/wilayas"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { INTERNSHIP_TYPE_COLORS } from "@/lib/constants/internship"

import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"
import type { SearchFiltersProps } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/types"
import {
  INTERNSHIP_TYPES,
  TYPE_DOT,
  WORK_MODES,
} from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/constants"
import { FilterSection } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/FilterSection"
import { SkillsFilter } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/SkillsFilter"

function toggleMultiValueFilter(
  filters: FilterState,
  onFiltersChange: (filters: FilterState) => void,
  key: "internshipTypes" | "workModes" | "skillTagIds",
  value: string,
) {
  const currentValues = filters[key]

  onFiltersChange({
    ...filters,
    [key]: currentValues.includes(value)
      ? currentValues.filter((entry) => entry !== value)
      : [...currentValues, value],
  })
}

export function SearchFilters({
  filters,
  onFiltersChange,
  skills,
  t,
}: SearchFiltersProps) {
  return (
    <div className="space-y-7">
      <FilterSection label={t("wilaya")}>
        <Select
          value={filters.wilayaCode?.toString() ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              wilayaCode: value === "all" ? undefined : Number(value),
            })
          }
        >
          <SelectTrigger className="rounded-none border-foreground/10 h-9 text-sm">
            <SelectValue placeholder={t("wilayaPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("wilayaPlaceholder")}</SelectItem>
            {WILAYA_OPTIONS.map((wilaya) => (
              <SelectItem key={wilaya.value} value={wilaya.value.toString()}>
                {wilaya.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filters.wilayaCode && (
          <p className="text-[10px] text-primary/70 font-medium mt-1">
            {getWilayaName(filters.wilayaCode)}
          </p>
        )}
      </FilterSection>

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

