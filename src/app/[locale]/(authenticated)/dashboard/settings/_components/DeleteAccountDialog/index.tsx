"use client"

import { useTranslations } from "next-intl"
import { DeleteAccountForm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/DeleteAccountDialog/components/DeleteAccountForm"

import { useDeleteAccount } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/DeleteAccountDialog/hooks/useDeleteAccount"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const t = useTranslations("dashboard.settings.deleteAccount")
  const state = useDeleteAccount()

  function handleOpenChange(next: boolean) {
    if (!next) state.reset()
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {t("title")}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>

        <DeleteAccountForm state={state} />
      </AlertDialogContent>
    </AlertDialog>
  )
}
