import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"

export interface SkillOption {
  id: string
  name: string
  category: string | null
}

export interface SearchFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  skills: SkillOption[]
  t: (key: string) => string
}
