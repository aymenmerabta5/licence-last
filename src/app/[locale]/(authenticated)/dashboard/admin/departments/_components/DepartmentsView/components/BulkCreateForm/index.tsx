"use client"

import { useTranslations } from "next-intl"
import { Plus, Loader2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { useBulkCreateForm } from "./hooks/useBulkCreateForm"
import { DepartmentRow } from "./components/DepartmentRow"

export function BulkCreateForm() {
  const t = useTranslations("dashboard.admin.departments.bulkCreate")
  const {
    rows,
    fieldErrors,
    addRow,
    removeRow,
    updateRow,
    handleSubmit,
    isPending,
  } = useBulkCreateForm()

  return (
    <section className="relative overflow-hidden border border-border/50 bg-background p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0" />

      <div className="space-y-5">
        <div className="space-y-1.5">
          <h3 className="flex items-center gap-2 font-serif text-xl text-heading">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-3.5 w-3.5" />
            </span>
            {t("title")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        {/* Column headers (visible on sm+) */}
        <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-3 sm:grid">
          <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
            {t("departmentName")} *
          </Label>
          <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
            {t("headEmail")} *
          </Label>
          <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
            {t("headName")} *
          </Label>
          <span className="w-9" />
        </div>

        <div className="space-y-3">
          {rows.map((row, i) => (
            <DepartmentRow
              key={i}
              index={i}
              row={row}
              errors={fieldErrors[i] ?? {}}
              canRemove={rows.length > 1}
              onUpdate={updateRow}
              onRemove={removeRow}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={isPending || rows.length >= 50}
            className="gap-1.5 rounded-lg"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addRow")}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            variant="editorial"
            size="editorial-sm"
            className="rounded-lg"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </div>
    </section>
  )
}
