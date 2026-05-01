"use client"

import { AlertTriangle, Loader2, MailWarning } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"

interface RefuseModalProps {
  studentName: string
  applicationId: string
  actionLoading: string | null
  refuseNote: string
  onNoteChange: (note: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function RefuseModal({
  studentName,
  applicationId,
  actionLoading,
  refuseNote,
  onNoteChange,
  onConfirm,
  onCancel,
}: RefuseModalProps) {
  const t = useTranslations("dashboard.company.candidates")

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="bg-background border border-border/50 max-w-md w-full overflow-hidden"
      >
        {/* Accent */}
        <div className="h-0.5 bg-destructive" />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-destructive/20 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-heading tracking-tight">
                {t("refuseTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {t("refuseDescription", { name: studentName })}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
              {t("refuseNotePlaceholder")}
            </label>
            <textarea
              value={refuseNote}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder={t("refuseNotePlaceholder")}
              className="w-full min-h-[100px] px-4 py-3 text-sm border-2 border-foreground/10 bg-transparent resize-none focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/30"
            />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 border border-destructive/15 bg-destructive/[0.03] p-3">
            <MailWarning className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("confirmRefuse")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="editorial-outline"
              size="editorial-sm"
              onClick={onCancel}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-none font-bold uppercase tracking-[0.12em] text-[11px]"
              onClick={onConfirm}
              disabled={actionLoading === applicationId}
            >
              {actionLoading === applicationId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("confirmRefuseButton")
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
