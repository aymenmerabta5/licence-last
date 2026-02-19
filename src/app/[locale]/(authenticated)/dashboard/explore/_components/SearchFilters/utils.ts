import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"

type MultiValueFilterKey = "internshipTypes" | "workModes" | "skillTagIds"

export function toggleMultiValueFilter(
  filters: FilterState,
  onFiltersChange: (filters: FilterState) => void,
  key: MultiValueFilterKey,
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
