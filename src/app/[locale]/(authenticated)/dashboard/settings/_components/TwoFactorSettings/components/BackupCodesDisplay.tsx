"use client"

import { AlertTriangle, Copy, Download } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface BackupCodesDisplayProps {
  codes: string[]
  onDone: () => void
}

export function BackupCodesDisplay({ codes, onDone }: BackupCodesDisplayProps) {
  const t = useTranslations("dashboard.settings.twoFactor.backupCodes")

  function copyAll() {
    navigator.clipboard.writeText(codes.join("\n"))
    toast.success(t("copied"))
  }

  function downloadCodes() {
    const content = `Internex Backup Codes\n${"=".repeat(30)}\n\n${codes.join("\n")}\n\nEach code can only be used once.`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "internex-backup-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h4 className="font-bold">{t("title")}</h4>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 border border-border/40 bg-muted/20 font-mono text-sm">
        {codes.map((code, i) => (
          <div
            key={i}
            className="p-2 text-center bg-background border border-border/20"
          >
            {code}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 border border-amber-500/30 bg-amber-500/5 text-xs">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <p className="text-amber-700 dark:text-amber-400">{t("warning")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="editorial-outline"
          className="rounded-xl h-10"
          onClick={copyAll}
        >
          <Copy className="h-3.5 w-3.5 me-1.5" />
          {t("copy")}
        </Button>
        <Button
          type="button"
          variant="editorial-outline"
          className="rounded-xl h-10"
          onClick={downloadCodes}
        >
          <Download className="h-3.5 w-3.5 me-1.5" />
          {t("download")}
        </Button>
        <Button
          type="button"
          variant="editorial"
          className="rounded-xl h-10"
          onClick={onDone}
        >
          {t("done")}
        </Button>
      </div>
    </div>
  )
}
