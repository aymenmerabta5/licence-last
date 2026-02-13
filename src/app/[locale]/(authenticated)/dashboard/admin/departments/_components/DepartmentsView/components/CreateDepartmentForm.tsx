"use client"

import { useTranslations } from "next-intl"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CreateDepartmentFormProps {
  name: string
  onNameChange: (v: string) => void
  headName: string
  onHeadNameChange: (v: string) => void
  isCreating: boolean
  onSubmit: () => void
}

export function CreateDepartmentForm({
  name,
  onNameChange,
  headName,
  onHeadNameChange,
  isCreating,
  onSubmit,
}: CreateDepartmentFormProps) {
  const t = useTranslations("dashboard.departments")

  return (
    <div className="border border-dashed border-primary/30 bg-primary/5 p-5 space-y-4">
      <h3 className="font-serif text-lg text-heading flex items-center gap-2">
        <Plus className="h-4 w-4" />
        {t("addDepartment")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("name")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("headName")}
          </label>
          <input
            type="text"
            value={headName}
            onChange={(e) => onHeadNameChange(e.target.value)}
            placeholder={t("headNamePlaceholder")}
            className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={isCreating || !name.trim()}
        className="gap-2"
      >
        {isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {t("save")}
      </Button>
    </div>
  )
}
