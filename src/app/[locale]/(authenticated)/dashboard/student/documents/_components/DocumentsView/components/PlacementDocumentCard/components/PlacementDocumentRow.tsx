import { Download, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PlacementDocumentRowProps {
  title: string
  statusLabel: string
  statusClassName: string
  verificationCodeLabel: string
  verificationCode: string | null
  notAvailableLabel: string
  isDownloading: boolean
  downloadLabel: string
  downloadingLabel: string
  onDownload: () => void
}

export function PlacementDocumentRow({
  title,
  statusLabel,
  statusClassName,
  verificationCodeLabel,
  verificationCode,
  notAvailableLabel,
  isDownloading,
  downloadLabel,
  downloadingLabel,
  onDownload,
}: PlacementDocumentRowProps) {
  return (
    <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_auto]">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-heading">{title}</p>
          <Badge variant="outline" className={statusClassName}>
            {statusLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {verificationCodeLabel}: {verificationCode ?? notAvailableLabel}
        </p>
      </div>

      <div className="flex items-center justify-start md:justify-end">
        <Button
          type="button"
          variant="editorial-outline"
          size="sm"
          onClick={onDownload}
          disabled={isDownloading}
          className="gap-1.5"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {isDownloading ? downloadingLabel : downloadLabel}
        </Button>
      </div>
    </div>
  )
}
