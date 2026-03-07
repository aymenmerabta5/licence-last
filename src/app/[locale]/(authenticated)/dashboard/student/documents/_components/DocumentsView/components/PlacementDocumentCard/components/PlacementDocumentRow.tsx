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
  isActionLoading: boolean
  isActionDisabled: boolean
  actionLabel: string
  actionLoadingLabel: string
  showDownloadIcon: boolean
  onAction: () => void
}

export function PlacementDocumentRow({
  title,
  statusLabel,
  statusClassName,
  verificationCodeLabel,
  verificationCode,
  notAvailableLabel,
  isActionLoading,
  isActionDisabled,
  actionLabel,
  actionLoadingLabel,
  showDownloadIcon,
  onAction,
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
          onClick={onAction}
          disabled={isActionDisabled}
          className="gap-1.5"
        >
          {isActionLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : showDownloadIcon ? (
            <Download className="h-3.5 w-3.5" />
          ) : null}
          {isActionLoading ? actionLoadingLabel : actionLabel}
        </Button>
      </div>
    </div>
  )
}
