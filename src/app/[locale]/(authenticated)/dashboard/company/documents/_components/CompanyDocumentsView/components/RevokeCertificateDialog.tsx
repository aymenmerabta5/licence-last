"use client"

import { AlertTriangle, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
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

interface RevokeCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isRevoking: boolean
}

export function RevokeCertificateDialog({
  open,
  onOpenChange,
  onConfirm,
  isRevoking,
}: RevokeCertificateDialogProps) {
  const t = useTranslations("dashboard.companyDocuments")
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    if (reason.trim().length > 0) {
      onConfirm(reason.trim())
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setReason("")
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md gap-6">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle className="font-serif text-lg">
              {t("revokeDialog.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("revokeDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="revoke-reason"
            className="text-sm font-medium text-foreground"
          >
            {t("revokeDialog.reasonLabel")}
          </label>
          <Textarea
            id="revoke-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("revokeDialog.reasonPlaceholder")}
            className="min-h-[80px] resize-none"
            disabled={isRevoking}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            onClick={() => handleOpenChange(false)}
            disabled={isRevoking}
          >
            {t("revokeDialog.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="editorial-sm"
            onClick={handleConfirm}
            disabled={reason.trim().length === 0 || isRevoking}
            className="gap-1.5"
          >
            {isRevoking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {isRevoking ? t("revoking") : t("revokeDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
