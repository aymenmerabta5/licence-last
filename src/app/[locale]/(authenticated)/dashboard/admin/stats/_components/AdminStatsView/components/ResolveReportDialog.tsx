"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReportResolutionStatus } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useResolveReport"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ReportDialogItem {
  id: string
  severity: string
  category: string
  description: string
}

interface ResolveReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportDialogItem | null
  status: ReportResolutionStatus
  resolutionNote: string
  isPending: boolean
  onStatusChange: (status: ReportResolutionStatus) => void
  onResolutionNoteChange: (value: string) => void
  onConfirm: () => void
}

export function ResolveReportDialog({
  open,
  onOpenChange,
  report,
  status,
  resolutionNote,
  isPending,
  onStatusChange,
  onResolutionNoteChange,
  onConfirm,
}: ResolveReportDialogProps) {
  const t = useTranslations("dashboard.admin.stats.reports")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {t("updateReportStatus")}
          </DialogTitle>
          <DialogDescription>
            {t("resolveOrDismiss")}
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="space-y-4 py-2">
            <div className="rounded-md border border-border/50 bg-muted/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {report.severity} - {report.category}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                {report.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("decision")}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    status === "resolved" ? "editorial" : "editorial-outline"
                  }
                  size="sm"
                  className="rounded-none"
                  onClick={() => onStatusChange("resolved")}
                  disabled={isPending}
                >
                  {t("resolve")}
                </Button>
                <Button
                  type="button"
                  variant={
                    status === "dismissed" ? "editorial" : "editorial-outline"
                  }
                  size="sm"
                  className="rounded-none"
                  onClick={() => onStatusChange("dismissed")}
                  disabled={isPending}
                >
                  {t("dismiss")}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-resolution-note">
                {t("resolutionNote")}
              </Label>
              <Textarea
                id="report-resolution-note"
                value={resolutionNote}
                onChange={(event) => onResolutionNoteChange(event.target.value)}
                placeholder={t("resolutionNotePlaceholder")}
                className="min-h-24 rounded-xl border-border/40"
                disabled={isPending}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="editorial-outline"
            className="rounded-none"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="editorial"
            className="gap-1.5 rounded-none"
            onClick={onConfirm}
            disabled={isPending || !report}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("saveDecision")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
