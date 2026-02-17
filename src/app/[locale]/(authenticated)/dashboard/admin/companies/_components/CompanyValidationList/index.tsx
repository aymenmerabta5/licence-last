"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import * as motion from "motion/react-client"
import { Loader2, Building2 } from "lucide-react"

import { ease } from "@/lib/animations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCompanyValidation } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/hooks/useCompanyValidation"
import { CompanyCard } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyCard"
import { RejectDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/RejectDialog"
import type { CompanyStatus } from "@/lib/schemas/enums"

export function CompanyValidationList() {
  const t = useTranslations("dashboard.admin.companies")
  const {
    companies,
    isLoading,
    statusFilter,
    setStatusFilter,
    approveCompany,
    isApproving,
    rejectCompany,
    isRejecting,
  } = useCompanyValidation()

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  function handleRejectClick(id: string) {
    setRejectingId(id)
    setRejectDialogOpen(true)
  }

  function handleRejectConfirm(reason: string) {
    if (!rejectingId) return
    rejectCompany(
      { companyId: rejectingId, reason },
      { onSuccess: () => setRejectDialogOpen(false) },
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="relative"
      >
        <div className="h-0.5 bg-primary" />
        <div className="border border-t-0 border-border/50 p-8 md:p-10">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />

          <div className="flex items-center justify-between mb-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
              {t("kicker")}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              {companies.length} {t("title").toLowerCase()}
            </span>
          </div>

          <h1 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading max-w-xl">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-lg mt-3">
            {t("description")}
          </p>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease }}
        className="flex items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
            Filter
          </span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as CompanyStatus | "all")}
          >
            <SelectTrigger className="w-48 h-10 border-border/40 bg-background">
              <SelectValue placeholder={t("statusFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("status.pending")}</SelectItem>
              <SelectItem value="approved">{t("status.approved")}</SelectItem>
              <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
              <SelectItem value="suspended">{t("status.suspended")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Company List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">
            Loading companies...
          </span>
        </div>
      ) : companies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease }}
          className="py-16 text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-secondary/10">
            <Building2 className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {t("noCompanies")}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {companies.map((comp, i) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease }}
            >
              <CompanyCard
                company={comp}
                onApprove={approveCompany}
                onReject={handleRejectClick}
                isApproving={isApproving}
                isRejecting={isRejecting}
              />
            </motion.div>
          ))}
        </div>
      )}

      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        isRejecting={isRejecting}
      />
    </div>
  )
}
