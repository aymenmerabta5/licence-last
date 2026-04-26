"use client"

import { Building2, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"
import { CompanyCard } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyCard"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"
import { ease } from "@/lib/animations"

interface CompanyValidationContentProps {
  companies: CompanyListItem[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasMore: boolean
  sentinelRef: RefObject<HTMLDivElement | null>
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSuspend: (id: string) => void
  onReactivate: (id: string) => void
  onDownloadVerificationDocument: (companyId: string) => void
  downloadingVerificationCompanyId: string | null
  onDelete: (company: CompanyListItem) => void
  isApproving: boolean
  isRejecting: boolean
  isSuspending: boolean
  isReactivating: boolean
  isDeleting: boolean
}

export function CompanyValidationContent({
  companies,
  isLoading,
  isFetchingNextPage,
  hasMore,
  sentinelRef,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onDownloadVerificationDocument,
  downloadingVerificationCompanyId,
  onDelete,
  isApproving,
  isRejecting,
  isSuspending,
  isReactivating,
  isDeleting,
}: CompanyValidationContentProps) {
  const t = useTranslations("dashboard.admin.companies")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading companies
        </span>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="border border-dashed border-border/60 p-12 text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <Building2 className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-lg text-heading">{t("noCompanies")}</p>
          <p className="text-sm font-light text-muted-foreground">
            No companies match the current filter.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="border-t border-border">
      {companies.map((company, index) => (
        <motion.div
          key={company.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05, ease }}
        >
          <CompanyCard
            company={company}
            onApprove={onApprove}
            onReject={onReject}
            onSuspend={onSuspend}
            onReactivate={onReactivate}
            onDownloadVerificationDocument={onDownloadVerificationDocument}
            isDownloadingVerificationDocument={
              downloadingVerificationCompanyId === company.id
            }
            onDelete={onDelete}
            isApproving={isApproving}
            isRejecting={isRejecting}
            isSuspending={isSuspending}
            isReactivating={isReactivating}
            isDeleting={isDeleting}
          />
        </motion.div>
      ))}

      {hasMore ? <div ref={sentinelRef} className="h-4" /> : null}

      {isFetchingNextPage ? (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Loading more
          </span>
        </div>
      ) : null}
    </div>
  )
}
