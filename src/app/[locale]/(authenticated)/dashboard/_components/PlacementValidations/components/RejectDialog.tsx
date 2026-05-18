"use client"

import { Loader2, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={!actionLoading}
        className="gap-6 sm:max-w-lg"
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive/70" />
            <DialogTitle>{t("rejectTitle")}</DialogTitle>
          </div>
          <DialogDescription>
            {t("rejectDescription", { name: studentName })}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={rejectReason}
          onChange={(event) => onRejectReasonChange(event.target.value)}
          placeholder={t("rejectReasonPlaceholder")}
          disabled={actionLoading}
          className="min-h-[100px] resize-none border-border/60 bg-background text-sm focus-visible:ring-primary/30"
        />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={actionLoading}
            className="border-border/60"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("confirmReject")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
