"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useUniversityValidation } from "./hooks/useUniversityValidation"
import { UniversityCard } from "./components/UniversityCard"
import { RejectDialog } from "./components/RejectDialog"
import type { UniversityStatus } from "@/lib/schemas/enums"

export function UniversityValidationList() {
  const t = useTranslations("dashboard.admin.universities")
  const {
    universities,
    isLoading,
    statusFilter,
    setStatusFilter,
    approveUniversity,
    isApproving,
    rejectUniversity,
    isRejecting,
  } = useUniversityValidation()

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  function handleRejectClick(id: string) {
    setRejectingId(id)
    setRejectDialogOpen(true)
  }

  function handleRejectConfirm(reason: string) {
    if (!rejectingId) return
    rejectUniversity(
      { universityId: rejectingId, reason },
      { onSuccess: () => setRejectDialogOpen(false) },
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="space-y-3">
        <Link
          href="/dashboard/admin/command-center"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 [[dir=rtl]_&]:rotate-180" />
          {t("backToCommandCenter")}
        </Link>
        <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-primary [[dir=rtl]_&]:tracking-normal">
          {t("kicker")}
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,4vw,3rem)] leading-tight tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-2xl">
          {t("description")}
        </p>
      </header>

      <Separator className="bg-border/60" />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as UniversityStatus | "all")}
        >
          <SelectTrigger className="w-48 h-10 border-border/40">
            <SelectValue placeholder={t("statusFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : universities.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground text-sm">
          {t("noUniversities")}
        </p>
      ) : (
        <div className="space-y-4">
          {universities.map((uni) => (
            <UniversityCard
              key={uni.id}
              university={uni}
              onApprove={approveUniversity}
              onReject={handleRejectClick}
              isApproving={isApproving}
              isRejecting={isRejecting}
            />
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
