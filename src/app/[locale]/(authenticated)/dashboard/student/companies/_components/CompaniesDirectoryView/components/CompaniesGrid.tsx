import { Building2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"

import { CompanyDirectoryCard } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/components/CompanyDirectoryCard"
import type { CompanyDirectoryItem } from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/types"
import { ease, reveal } from "@/lib/animations"

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
        <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border/60">
          <Building2 className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    )
  }

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.05 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company, i) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.03 * (i % 12) }}
          >
            <CompanyDirectoryCard company={company} />
          </motion.div>
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
    </motion.div>
  )
}
