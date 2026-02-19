"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ease } from "@/lib/animations"
import type { CompanyStatus } from "@/lib/schemas/enums"

interface CompanyStatusFilterProps {
  statusFilter: CompanyStatus | "all"
  onStatusChange: (status: CompanyStatus | "all") => void
}

export function CompanyStatusFilter({
  statusFilter,
  onStatusChange,
}: CompanyStatusFilterProps) {
  const t = useTranslations("dashboard.admin.companies")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease }}
      className="flex items-center justify-end mb-6"
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Filter
        </span>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            if (value) {
              onStatusChange(value as CompanyStatus | "all")
            }
          }}
        >
          <SelectTrigger className="h-9 w-44 rounded-sm border-border bg-background hover:bg-muted/10 font-medium text-sm transition-colors">
            <SelectValue placeholder={t("statusFilter")} />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border">
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
            <SelectItem value="suspended">{t("status.suspended")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  )
}
