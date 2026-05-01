"use client"

import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"

interface AcceptModalProps {
  studentName: string
  applicationId: string
  actionLoading: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function AcceptModal({
  studentName,
  applicationId,
  actionLoading,
  onConfirm,
  onCancel,
}: AcceptModalProps) {
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
        <div className="h-0.5 bg-emerald-600" />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-emerald-600/20 bg-emerald-600/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-heading tracking-tight">
                {t("acceptTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {t("acceptDescription", { name: studentName })}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {/* Notice */}
          <div className="flex items-start gap-2 border border-emerald-600/15 bg-emerald-600/[0.03] p-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("acceptNotice")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="editorial-outline"
              size="editorial-sm"
              onClick={onCancel}
              className="rounded-none"
            >
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              className="rounded-none bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-[0.12em] text-[11px]"
              onClick={onConfirm}
              disabled={actionLoading === applicationId}
            >
              {actionLoading === applicationId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("confirmAcceptButton")
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
