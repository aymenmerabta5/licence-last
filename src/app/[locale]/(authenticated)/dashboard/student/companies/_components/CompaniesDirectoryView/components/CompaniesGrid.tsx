import { Building2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"

import { CompanyDirectoryCard } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/components/CompanyDirectoryCard"
import type { CompanyDirectoryItem } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/types"

interface CompaniesGridProps {
  companies: CompanyDirectoryItem[]
  isLoading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  sentinelRef: RefObject<HTMLDivElement | null>
}

export function CompaniesGrid({
  companies,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
}: CompaniesGridProps) {
  const t = useTranslations("dashboard.studentCompanies")

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse border border-border/40 bg-muted/10"
          />
        ))}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border/40 py-16 text-center">
        <Building2 className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <CompanyDirectoryCard key={company.id} company={company} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex flex-col items-center gap-3">
          <div ref={sentinelRef} className="h-2 w-full" />
          {isFetchingNextPage && (
            <p className="text-xs text-muted-foreground">{t("loadingMore")}</p>
          )}
        </div>
      )}
    </div>
  )
}
