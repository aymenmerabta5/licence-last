"use client"

import { useTranslations } from "next-intl"

import { RejectReasonDialog } from "@/components/dialogs/RejectReasonDialog"

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  onConfirm: (reason: string) => void
  isRejecting: boolean
}

export function RejectDialog({
  open,
  onOpenChange,
  studentName,
  onConfirm,
  isRejecting,
}: RejectDialogProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <RejectReasonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("rejectTitle")}
      description={t("rejectDescription", { name: studentName })}
      reasonLabel={t("rejectReasonPlaceholder")}
      reasonPlaceholder={t("rejectReasonPlaceholder")}
      cancelLabel={t("cancel")}
      confirmLabel={t("confirmReject")}
      reasonId="reject-placement-reason"
      isPending={isRejecting}
      onConfirm={onConfirm}
    />
  )
}
