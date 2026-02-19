"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ease } from "@/lib/animations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UniversityStatus } from "@/lib/schemas/enums"

interface UniversityStatusFilterProps {
  statusFilter: UniversityStatus | "all"
  onStatusChange: (status: UniversityStatus | "all") => void
}

export function UniversityStatusFilter({
  statusFilter,
  onStatusChange,
}: UniversityStatusFilterProps) {
  const t = useTranslations("dashboard.admin.universities")

  return (
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
          onValueChange={(value) => {
            if (value) {
              onStatusChange(value as UniversityStatus | "all")
            }
          }}
        >
          <SelectTrigger className="h-10 w-48 border-border/40 bg-background">
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
    </motion.div>
  )
}
