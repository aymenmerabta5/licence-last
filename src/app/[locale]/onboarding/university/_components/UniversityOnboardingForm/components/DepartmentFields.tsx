"use client"

import { useTranslations } from "next-intl"
import { Building2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UniversityOnboardingFormApi } from "../hooks/useUniversityOnboarding"

interface DepartmentFieldsProps {
  form: UniversityOnboardingFormApi
}

export function DepartmentFields({ form }: DepartmentFieldsProps) {
  const t = useTranslations("onboarding.university")

  return (
    <form.Field name="departments">
      {(field) => {
        const departments = field.state.value

        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Building2 className="inline-block h-3.5 w-3.5 me-1.5 -mt-0.5" />
                {t("departments")}
              </Label>
              <p className="text-[11px] text-muted-foreground/70">
                {t("departmentsHint")}
              </p>
            </div>

            <div className="space-y-2">
              {departments.map((dept, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={dept.name}
                    onChange={(e) => {
                      const updated = [...departments]
                      updated[index] = { name: e.target.value }
                      field.handleChange(updated)
                    }}
                    placeholder={t("departmentPlaceholder")}
                    className="h-11 border-border/40 bg-background text-sm"
                  />
                  {departments.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        const updated = departments.filter((_, i) => i !== index)
                        field.handleChange(updated)
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">{t("removeDepartment")}</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-xs border-dashed"
              onClick={() => field.handleChange([...departments, { name: "" }])}
            >
              <Plus className="h-3.5 w-3.5 me-1.5" />
              {t("addDepartment")}
            </Button>
          </div>
        )
      }}
    </form.Field>
  )
}
