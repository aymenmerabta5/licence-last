"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: DepartmentItem | null
  onConfirm: (departmentId: string) => void
  isPending: boolean
}

export function DeleteDepartmentDialog({
  open,
  onOpenChange,
  department,
  onConfirm,
  isPending,
}: DeleteDepartmentDialogProps) {
  const t = useTranslations("dashboard.admin.departments")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">
            {t("deleteDepartmentTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDepartmentDescription", { name: department?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            className="rounded-none"
            disabled={isPending}
            onClick={() => department && onConfirm(department.id)}
          >
            {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {t("deleteDepartment")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
