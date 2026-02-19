"use client"

import { CheckCircle2, Loader2 } from "lucide-react"
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
        {/* Header accent */}
        <div className="h-0.5 bg-emerald-600" />
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/10 shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-heading tracking-tight">
                {t("acceptTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("acceptDescription", { name: studentName })}
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="editorial-outline"
              size="editorial-sm"
              onClick={onCancel}
            >
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider text-[11px]"
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
