"use client"

import { Search } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { ExploreHeader } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/ExploreHeader"
import { OffersGrid } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/OffersGrid"
import { SearchBar } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/SearchBar"
import { SearchCopilotPanel } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/components/SearchCopilotPanel"
import { useOfferSearch } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/hooks/useOfferSearch"
import { useSearchCopilot } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/hooks/useSearchCopilot"
import { SearchFilters } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters"
import { ease, reveal } from "@/lib/animations"

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

  const { aiQuery, setAiQuery, aiSuggestion, aiStatus, aiError, parseFilters } =
    useSearchCopilot()

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
        languageCodes: [],
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <ExploreHeader />

      {/* Search & Filters Section */}
      <motion.section
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.05 }}
        className="border border-border/50"
      >
        <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
          <Search className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl text-heading">{t("title")}</h2>
        </div>
        <div className="px-6 py-6 space-y-6">
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
        </div>
      </motion.section>

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
