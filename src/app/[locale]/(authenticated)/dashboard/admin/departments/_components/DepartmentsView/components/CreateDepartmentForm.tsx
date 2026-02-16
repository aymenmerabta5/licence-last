"use client"

import { useTranslations } from "next-intl"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const t = useTranslations("dashboard.admin.departments")

  return (
    <section className="relative overflow-hidden border border-border/50 bg-background p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0" />

      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-serif text-xl text-heading">{t("addDepartment")}</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("name")} *
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="h-10 rounded-xl border-border/60"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("headName")}
            </Label>
            <Input
              type="text"
              value={headName}
              onChange={(e) => onHeadNameChange(e.target.value)}
              placeholder={t("headNamePlaceholder")}
              className="h-10 rounded-xl border-border/60"
            />
          </div>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isCreating || !name.trim()}
          variant="editorial"
          size="editorial-sm"
          className="rounded-lg"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {t("save")}
        </Button>
      </div>
    </section>
  )
}
