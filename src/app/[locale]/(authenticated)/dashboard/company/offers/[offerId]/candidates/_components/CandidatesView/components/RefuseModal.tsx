"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border p-6 max-w-md w-full space-y-4"
      >
        <h3 className="font-serif text-lg text-heading">{t("refuseTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("refuseDescription", { name: studentName })}
        </p>
        <textarea
          value={refuseNote}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={t("refuseNotePlaceholder")}
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
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
      </motion.div>
    </div>
  )
}
