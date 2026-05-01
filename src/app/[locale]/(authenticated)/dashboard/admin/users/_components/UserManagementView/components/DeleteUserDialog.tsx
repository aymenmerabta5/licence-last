"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onConfirm: (userId: string) => void
  isPending: boolean
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isPending,
}: DeleteUserDialogProps) {
  const t = useTranslations("dashboard.superAdmin.users")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">
            {t("dialogs.delete.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("dialogs.delete.description", { email: user?.email ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
            {t("dialogs.cancel")}
          </Button>
          <Button
            variant="destructive"
            className="rounded-none"
            disabled={isPending}
            onClick={() => user && onConfirm(user.id)}
          >
            {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {t("dialogs.delete.submit")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
