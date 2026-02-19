import { Download, Loader2 } from "lucide-react"
import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>

interface PlacementDocumentPanelProps {
  title: string
  statusLabel: string
  statusClassName: string
  verificationCodeLabel: string
  verificationCode: string | null
  notAvailableLabel: string
  actionVariant: ButtonVariant
  actionLabel: string
  actionLoadingLabel: string
  showDownloadIcon: boolean
  isActionLoading: boolean
  isActionDisabled: boolean
  onAction: () => void
}

export function PlacementDocumentPanel({
  title,
  statusLabel,
  statusClassName,
  verificationCodeLabel,
  verificationCode,
  notAvailableLabel,
  actionVariant,
  actionLabel,
  actionLoadingLabel,
  showDownloadIcon,
  isActionLoading,
  isActionDisabled,
  onAction,
}: PlacementDocumentPanelProps) {
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
          variant={actionVariant}
          size="sm"
          className="gap-1.5"
          onClick={onAction}
          disabled={isActionDisabled}
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
