"use client"

import { CompaniesDirectoryHeader } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/components/CompaniesDirectoryHeader"
import { CompaniesGrid } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/components/CompaniesGrid"
import { useCompaniesDirectory } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/hooks/useCompaniesDirectory"

export function CompaniesDirectoryView() {
  const {
    keyword,
    setKeyword,
    wilayaCode,
    setWilayaCode,
    companies,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    sentinelRef,
    hasActiveFilters,
    clearFilters,
  } = useCompaniesDirectory()

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <CompaniesDirectoryHeader
        keyword={keyword}
        onKeywordChange={setKeyword}
        wilayaCode={wilayaCode}
        onWilayaCodeChange={setWilayaCode}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <CompaniesGrid
        companies={companies}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
      />
    </div>
  )
}
