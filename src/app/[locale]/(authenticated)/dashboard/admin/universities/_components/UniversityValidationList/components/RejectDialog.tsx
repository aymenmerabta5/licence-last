import { useTranslations } from "next-intl"
import { RejectReasonDialog } from "@/components/dialogs/RejectReasonDialog"

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isRejecting: boolean
}

export function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isRejecting,
}: RejectDialogProps) {
  const t = useTranslations("dashboard.admin.universities.rejectDialog")

  return (
    <RejectReasonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
      reasonLabel={t("reasonLabel")}
      reasonPlaceholder={t("reasonPlaceholder")}
      cancelLabel={t("cancel")}
      confirmLabel={t("confirm")}
      reasonId="reject-university-reason"
      isPending={isRejecting}
      onConfirm={onConfirm}
    />
  )
}
