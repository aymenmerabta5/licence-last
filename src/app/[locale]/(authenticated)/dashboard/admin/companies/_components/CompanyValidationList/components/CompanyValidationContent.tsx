"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Building2, Loader2 } from "lucide-react"

import { ease } from "@/lib/animations"
import { CompanyCard } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyCard"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"

interface CompanyValidationContentProps {
  companies: CompanyListItem[]
  isLoading: boolean
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSuspend: (id: string) => void
  onReactivate: (id: string) => void
  isApproving: boolean
  isRejecting: boolean
  isSuspending: boolean
  isReactivating: boolean
}

export function CompanyValidationContent({
  companies,
  isLoading,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  isApproving,
  isRejecting,
  isSuspending,
  isReactivating,
}: CompanyValidationContentProps) {
  const t = useTranslations("dashboard.admin.companies")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Loading companies...
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
        className="space-y-3 py-16 text-center"
      >
        <div className="inline-flex items-center justify-center rounded-2xl bg-secondary/10 p-4">
          <Building2 className="h-6 w-6 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {t("noCompanies")}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {companies.map((company, index) => (
        <motion.div
          key={company.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + index * 0.06, ease }}
        >
          <CompanyCard
            company={company}
            onApprove={onApprove}
            onReject={onReject}
            onSuspend={onSuspend}
            onReactivate={onReactivate}
            isApproving={isApproving}
            isRejecting={isRejecting}
            isSuspending={isSuspending}
            isReactivating={isReactivating}
          />
        </motion.div>
      ))}
    </div>
  )
}
