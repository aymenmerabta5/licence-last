"use client"

import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RevokeConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "single" | "all"
  count?: number
  onConfirm: () => void
  isLoading: boolean
}

export function RevokeConfirmDialog({
  open,
  onOpenChange,
  mode,
  count,
  onConfirm,
  isLoading,
}: RevokeConfirmDialogProps) {
  const t = useTranslations("dashboard.settings.sessions")

  const ns = mode === "single" ? "revokeDialog" : "revokeAllDialog"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`${ns}.title`)}</AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "all"
              ? t("revokeAllDialog.description", { count: count ?? 0 })
              : t("revokeDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t(`${ns}.cancel`)}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {t(`${ns}.confirm`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
