"use client"

import { Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

interface RejectDialogProps {
  studentName: string
  rejectReason: string
  onRejectReasonChange: (value: string) => void
  actionLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

export function RejectDialog({
  studentName,
  rejectReason,
  onRejectReasonChange,
  actionLoading,
  onConfirm,
  onClose,
}: RejectDialogProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-4 rounded-none border border-border bg-background p-6"
      >
        <h3 className="font-serif text-lg text-heading">{t("rejectTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("rejectDescription", { name: studentName })}
        </p>
        <textarea
          value={rejectReason}
          onChange={(event) => onRejectReasonChange(event.target.value)}
          placeholder={t("rejectReasonPlaceholder")}
          className="min-h-[80px] w-full resize-none border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-none">
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={actionLoading}
            className="rounded-none"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("confirmReject")
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
