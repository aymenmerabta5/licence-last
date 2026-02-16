"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Loader2, AlertTriangle } from "lucide-react"

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
        {/* Header with accent */}
        <div className="h-0.5 bg-destructive" />
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-destructive/10 shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-heading tracking-tight">
                {t("refuseTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("refuseDescription", { name: studentName })}
              </p>
            </div>
          </div>

          <textarea
            value={refuseNote}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={t("refuseNotePlaceholder")}
            className="w-full min-h-[100px] px-4 py-3 text-sm border border-border/50 bg-secondary/5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors rounded-sm"
          />

          <div className="flex gap-2 justify-end pt-2">
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
              className="font-bold uppercase tracking-wider text-[11px]"
              onClick={onConfirm}
              disabled={actionLoading === applicationId}
            >
              {actionLoading === applicationId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("confirmRefuse")
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
