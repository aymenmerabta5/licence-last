"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"

import { SearchFilters } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters"

import { useOfferSearch } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/hooks/useOfferSearch"
import { useSearchCopilot } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/hooks/useSearchCopilot"
import { ExploreHeader } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/ExploreHeader"
import { SearchBar } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/SearchBar"
import { SearchCopilotPanel } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/SearchCopilotPanel"
import { OffersGrid } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/OffersGrid"

export type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/hooks/useOfferSearch"

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
    activeFilterCount,
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

  // Auto-apply AI suggestion when it arrives
  const prevSuggestionRef = useRef(aiSuggestion)
  useEffect(() => {
    if (aiSuggestion && aiSuggestion !== prevSuggestionRef.current) {
      const availableIds = new Set(skills.map((s) => s.id))
      const safeSkillIds = aiSuggestion.skillTagIds.filter((id) =>
        availableIds.has(id),
      )
      setFilters({
        wilayaCode: aiSuggestion.wilayaCode,
        internshipTypes: aiSuggestion.internshipTypes,
        workModes: aiSuggestion.workModes,
        skillTagIds: safeSkillIds,
      })
      if (aiSuggestion.keyword) setKeyword(aiSuggestion.keyword)
    }
    prevSuggestionRef.current = aiSuggestion
  }, [aiSuggestion, skills, setFilters, setKeyword])

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
        activeFilterCount={activeFilterCount}
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
      />

      <OffersGrid
        offers={offers}
        totalCount={offers.length}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        filterPanel={filterPanel}
      />
    </div>
  )
}
