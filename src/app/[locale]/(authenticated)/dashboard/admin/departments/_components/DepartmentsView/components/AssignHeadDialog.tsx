"use client"

import { Loader2, Mail, UserRound } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AssignHeadDialogProps {
  open: boolean
  departmentName: string | null
  headEmail: string
  onHeadEmailChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSaving: boolean
}

export function AssignHeadDialog({
  open,
  departmentName,
  headEmail,
  onHeadEmailChange,
  onOpenChange,
  onConfirm,
  isSaving,
}: AssignHeadDialogProps) {
  const t = useTranslations("dashboard.admin.departments")
  const isDisabled = isSaving || !headEmail.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-heading">
            {t("assignHeadTitle")}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">{t("assignHeadDescription")}</span>
            {departmentName && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary [[dir=rtl]_&]:tracking-normal">
                <UserRound className="h-3 w-3" />
                {departmentName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("bulkCreate.headEmail")} *
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={headEmail}
                onChange={(event) => onHeadEmailChange(event.target.value)}
                placeholder={t("bulkCreate.headEmailPlaceholder")}
                className="h-10 border-border/60 ps-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t("passwordResetHint")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="editorial"
              size="editorial-sm"
              className="rounded-none"
              onClick={onConfirm}
              disabled={isDisabled}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("assignHead")
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
