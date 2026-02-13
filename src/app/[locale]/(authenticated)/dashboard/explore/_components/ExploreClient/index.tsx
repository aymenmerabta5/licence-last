"use client"

import { useTranslations } from "next-intl"

import { SearchFilters } from "../SearchFilters"

import { useOfferSearch } from "./hooks/useOfferSearch"
import { useSearchCopilot } from "./hooks/useSearchCopilot"
import { ExploreHeader } from "./components/ExploreHeader"
import { SearchBar } from "./components/SearchBar"
import { SearchCopilotPanel } from "./components/SearchCopilotPanel"
import { OffersGrid } from "./components/OffersGrid"

export type { FilterState } from "./hooks/useOfferSearch"

export function ExploreClient() {
  const t = useTranslations("dashboard.explore")

  const {
    keyword,
    setKeyword,
    filters,
    setFilters,
    skills,
    offers,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    hasActiveFilters,
    clearFilters,
  } = useOfferSearch()

  const {
    aiQuery,
    setAiQuery,
    aiSuggestion,
    aiStatus,
    aiError,
    parseFilters,
  } = useSearchCopilot()

  const filterPanel = (
    <SearchFilters
      filters={filters}
      onFiltersChange={setFilters}
      skills={skills}
      t={t}
    />
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ExploreHeader />

      <SearchBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        filterPanel={filterPanel}
      />

      <SearchCopilotPanel
        aiQuery={aiQuery}
        onAiQueryChange={setAiQuery}
        aiStatus={aiStatus}
        aiError={aiError}
        aiSuggestion={aiSuggestion}
        skills={skills}
        onParseFilters={parseFilters}
        onApplySuggestion={(suggestion) => {
          const availableIds = new Set(skills.map((s) => s.id))
          const safeSkillIds = suggestion.skillTagIds.filter((id) =>
            availableIds.has(id),
          )
          setFilters({
            wilayaCode: suggestion.wilayaCode,
            internshipTypes: suggestion.internshipTypes,
            workModes: suggestion.workModes,
            skillTagIds: safeSkillIds,
          })
          if (suggestion.keyword) setKeyword(suggestion.keyword)
        }}
      />

      <OffersGrid
        offers={offers}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        filterPanel={filterPanel}
      />
    </div>
  )
}
