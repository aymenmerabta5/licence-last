"use client"

import { Building2, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { CompanyCard } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyCard"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"
import { ease } from "@/lib/animations"

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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="flex flex-col items-center justify-center border border-dashed border-border py-20 px-6 text-center"
      >
        <Building2 className="mb-4 h-8 w-8 text-muted-foreground/30 font-light" />
        <p className="font-serif text-lg tracking-tight text-heading">
          {t("noCompanies")}
        </p>
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
