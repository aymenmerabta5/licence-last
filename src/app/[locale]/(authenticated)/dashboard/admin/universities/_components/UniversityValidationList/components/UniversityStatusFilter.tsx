"use client"

import { Search } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ease } from "@/lib/animations"
import type { UniversityStatus } from "@/lib/schemas/enums"

interface UniversityStatusFilterProps {
  statusFilter: UniversityStatus | "all"
  onStatusChange: (status: UniversityStatus | "all") => void
  search: string
  onSearchChange: (search: string) => void
}

export function UniversityStatusFilter({
  statusFilter,
  onStatusChange,
  search,
  onSearchChange,
}: UniversityStatusFilterProps) {
  const t = useTranslations("dashboard.admin.universities")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease }}
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="relative w-full sm:max-w-xs">
        <label htmlFor="university-validation-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          id="university-validation-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-9 rounded-sm border-border bg-background ps-9 text-sm hover:bg-muted/10"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Filter
        </span>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            if (value) {
              onStatusChange(value as UniversityStatus | "all")
            }
          }}
          items={[
            { value: "all", label: t("allStatuses") },
            { value: "pending", label: t("status.pending") },
            { value: "approved", label: t("status.approved") },
            { value: "rejected", label: t("status.rejected") },
          ]}
        >
          <SelectTrigger className="h-9 w-44 rounded-sm border-border bg-background font-medium text-sm transition-colors hover:bg-muted/10">
            <SelectValue placeholder={t("statusFilter")} />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border">
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
