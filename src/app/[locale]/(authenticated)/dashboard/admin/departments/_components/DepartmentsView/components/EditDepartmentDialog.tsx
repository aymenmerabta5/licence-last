"use client"

import { Loader2, Pencil } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: DepartmentItem | null
  onConfirm: (departmentId: string, name: string) => void
  isPending: boolean
}

export function EditDepartmentDialog({
  open,
  onOpenChange,
  department,
  onConfirm,
  isPending,
}: EditDepartmentDialogProps) {
  const t = useTranslations("dashboard.admin.departments")
  const [name, setName] = useState("")

  useEffect(() => {
    if (department) {
      setName(department.name)
    }
  }, [department])

  const trimmedName = name.trim()
  const isDisabled =
    isPending || !trimmedName || trimmedName === department?.name

  const handleSubmit = () => {
    if (!department || isDisabled) return
    onConfirm(department.id, trimmedName)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-heading">
            {t("editDepartmentTitle")}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">{t("editDepartmentDescription")}</span>
            {department && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary [[dir=rtl]_&]:tracking-normal">
                <Pencil className="h-3 w-3" />
                {department.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("name")} *
            </Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("namePlaceholder")}
              className="h-10 rounded-xl border-border/60"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isDisabled) {
                  handleSubmit()
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="editorial"
              size="editorial-sm"
              className="rounded-none"
              onClick={handleSubmit}
              disabled={isDisabled}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
