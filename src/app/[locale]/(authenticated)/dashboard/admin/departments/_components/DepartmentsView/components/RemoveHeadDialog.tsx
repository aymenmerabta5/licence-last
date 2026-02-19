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

interface RemoveHeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: DepartmentItem | null
  onConfirm: (departmentId: string) => void
  isPending: boolean
}

export function RemoveHeadDialog({
  open,
  onOpenChange,
  department,
  onConfirm,
  isPending,
}: RemoveHeadDialogProps) {
  const t = useTranslations("dashboard.admin.departments")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">
            {t("removeHeadTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("removeHeadDescription", {
              name: department?.name ?? "",
              headName: department?.headName ?? "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => department && onConfirm(department.id)}
          >
            {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {t("removeHead")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
