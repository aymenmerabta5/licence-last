"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isRejecting: boolean
}

export function RejectDialog({ open, onOpenChange, onConfirm, isRejecting }: RejectDialogProps) {
  const t = useTranslations("dashboard.admin.companies.rejectDialog")
  const [reason, setReason] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="reject-reason"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              {t("reasonLabel")}
            </Label>
            <Input
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              className="h-11 border-border/40"
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="editorial-outline"
              className="rounded-xl h-10"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="editorial"
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl h-10"
              disabled={isRejecting || !reason.trim()}
              onClick={() => {
                onConfirm(reason)
                setReason("")
              }}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("confirm")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
