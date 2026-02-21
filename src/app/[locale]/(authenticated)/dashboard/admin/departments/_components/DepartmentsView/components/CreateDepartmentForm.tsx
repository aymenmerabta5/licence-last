"use client"

import { Loader2, Plus } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UniversityOption {
  id: string
  name: string
}

interface CreateDepartmentFormProps {
  name: string
  onNameChange: (v: string) => void
  canCreate: boolean
  showUniversitySelector?: boolean
  selectedUniversityId?: string
  universityOptions?: UniversityOption[]
  onUniversityIdChange?: (id: string) => void
  isCreating: boolean
  onSubmit: () => void
}

export function CreateDepartmentForm({
  name,
  onNameChange,
  canCreate,
  showUniversitySelector = false,
  selectedUniversityId,
  universityOptions = [],
  onUniversityIdChange,
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
          <h3 className="font-serif text-xl text-heading">
            {t("addDepartment")}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {showUniversitySelector ? (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
                {t("university")} *
              </Label>
              <Select
                value={selectedUniversityId}
                onValueChange={(value) => {
                  if (value) onUniversityIdChange?.(value)
                }}
              >
                <SelectTrigger className="h-10 rounded-xl border-border/60">
                  <SelectValue placeholder={t("selectUniversity")} />
                </SelectTrigger>
                <SelectContent>
                  {universityOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

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
        </div>

        <Button
          onClick={onSubmit}
          disabled={isCreating || !name.trim() || !canCreate}
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
