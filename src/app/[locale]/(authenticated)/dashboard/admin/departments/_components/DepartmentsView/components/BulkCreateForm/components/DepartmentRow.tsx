"use client"

import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BulkDepartmentRow } from "@/lib/schemas/department"

interface DepartmentRowProps {
  index: number
  row: BulkDepartmentRow
  errors: Partial<Record<keyof BulkDepartmentRow, string>>
  canRemove: boolean
  onUpdate: (
    index: number,
    field: keyof BulkDepartmentRow,
    value: string,
  ) => void
  onRemove: (index: number) => void
}

export function DepartmentRow({
  index,
  row,
  errors,
  canRemove,
  onUpdate,
  onRemove,
}: DepartmentRowProps) {
  const t = useTranslations("dashboard.admin.departments.bulkCreate")

  return (
    <div className="grid grid-cols-1 items-start gap-3 rounded-xl border border-border/60 bg-muted/10 p-3 sm:grid-cols-[1fr_1fr_auto]">
      <div className="space-y-1">
        <Input
          type="text"
          value={row.departmentName}
          onChange={(e) => onUpdate(index, "departmentName", e.target.value)}
          placeholder={t("departmentNamePlaceholder")}
          className="h-10 border-border/60"
        />
        {errors.departmentName && (
          <p className="text-xs text-destructive">{errors.departmentName}</p>
        )}
      </div>

      <div className="space-y-1">
        <Input
          type="email"
          value={row.headEmail}
          onChange={(e) => onUpdate(index, "headEmail", e.target.value)}
          placeholder={t("headEmailPlaceholder")}
          className="h-10 border-border/60"
        />
        {errors.headEmail && (
          <p className="text-xs text-destructive">{errors.headEmail}</p>
        )}
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="mt-0 text-muted-foreground hover:text-destructive sm:mt-0"
          aria-label={t("removeRow")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
