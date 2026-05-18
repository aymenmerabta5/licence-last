"use client"

import { CheckCircle2, Loader2 } from "lucide-react"
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

interface ValidateConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}

export function ValidateConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: ValidateConfirmationDialogProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-6">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <AlertDialogTitle className="font-serif tracking-tight">
              {t("confirmValidate")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="leading-relaxed">
            {t("validateAndGenerate")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isLoading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("validateAndGenerate")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
