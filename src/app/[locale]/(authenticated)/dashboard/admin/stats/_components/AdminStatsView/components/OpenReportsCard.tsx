"use client"

import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react"
import * as motion from "motion/react-client"
import { useState } from "react"
import { ResolveReportDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/ResolveReportDialog"
import type {
  ReportResolutionStatus,
  ResolveReportInput,
} from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useResolveReport"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

const SEVERITY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  critical: {
    bg: "bg-rose-500/10",
    text: "text-rose-600",
    border: "border-s-rose-500",
  },
  high: {
    bg: "bg-orange-500/10",
    text: "text-orange-600",
    border: "border-s-orange-500",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-s-amber-500",
  },
  low: {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    border: "border-s-blue-500",
  },
}

interface Report {
  id: string
  severity: string
  category: string
  description: string
}

interface OpenReportsCardProps {
  reports: Report[]
  isLoading: boolean
  isResolving: boolean
  onResolve: (input: ResolveReportInput) => Promise<unknown>
}

export function OpenReportsCard({
  reports,
  isLoading,
  isResolving,
  onResolve,
}: OpenReportsCardProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [nextStatus, setNextStatus] =
    useState<ReportResolutionStatus>("resolved")
  const [resolutionNote, setResolutionNote] = useState("")

  function openDialog(report: Report, status: ReportResolutionStatus) {
    setSelectedReport(report)
    setNextStatus(status)
    setResolutionNote("")
  }

  async function handleConfirmResolution() {
    if (!selectedReport) {
      return
    }

    const report = selectedReport
    setSelectedReport(null)
    setResolutionNote("")

    try {
      await onResolve({
        reportId: report.id,
        status: nextStatus,
        resolutionNote: resolutionNote.trim() || undefined,
      })
    } catch {
      return
    }
  }

  function handleDialogChange(open: boolean) {
    if (!open) {
      setSelectedReport(null)
      setResolutionNote("")
    }
  }

  return (
    <>
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.45, ease }}
        className="space-y-3 sm:space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-heading tracking-tight">
              Open Reports
            </h2>
          </div>
          {reports.length > 0 && (
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {reports.length} open
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading reports...
            </span>
          </div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="py-8 sm:py-10 text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-500/5">
              <AlertTriangle className="h-5 w-5 text-emerald-500/40" />
            </div>
            <p className="text-sm text-muted-foreground/60 font-medium">
              No open reports.
            </p>
            <p className="text-[10px] text-muted-foreground/40">
              All company reports have been resolved.
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-[24rem] overflow-y-auto pe-1 md:max-h-none">
          {reports.map((report, i) => {
            const severity =
              SEVERITY_STYLES[report.severity] ?? SEVERITY_STYLES.medium

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease }}
                className={cn(
                  "border-s-3 p-3 sm:p-4 rounded-e-lg bg-background transition-colors hover:bg-secondary/20",
                  severity.border,
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          severity.bg,
                          severity.text,
                        )}
                      >
                        {report.severity}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                        {report.category}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-foreground/80 leading-relaxed line-clamp-3 sm:line-clamp-2">
                      {report.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="editorial-outline"
                        className="h-8 px-3 text-[11px]"
                        disabled={isResolving}
                        onClick={() => openDialog(report, "resolved")}
                      >
                        Resolve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-[11px] text-muted-foreground hover:text-foreground"
                        disabled={isResolving}
                        onClick={() => openDialog(report, "dismissed")}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <ResolveReportDialog
        open={selectedReport !== null}
        onOpenChange={handleDialogChange}
        report={selectedReport}
        status={nextStatus}
        resolutionNote={resolutionNote}
        isPending={isResolving}
        onStatusChange={setNextStatus}
        onResolutionNoteChange={setResolutionNote}
        onConfirm={handleConfirmResolution}
      />
    </>
  )
}
