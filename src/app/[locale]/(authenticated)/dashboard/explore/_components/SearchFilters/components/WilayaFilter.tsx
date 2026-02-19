import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getWilayaName, WILAYA_OPTIONS } from "@/lib/wilayas"

import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"
import { FilterSection } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/FilterSection"

interface WilayaFilterProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  t: (key: string) => string
}

export function WilayaFilter({ filters, onFiltersChange, t }: WilayaFilterProps) {
  return (
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
  )
}
