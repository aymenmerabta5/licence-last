import { Download, FileCheck, Loader2, type LucideIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>

interface ExtraAction {
  label: string
  variant: ButtonVariant
  icon: LucideIcon
  isLoading: boolean
  onClick: () => void
}

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
  disabledReason?: string
  onAction: () => void
  extraActions?: ExtraAction[]
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
  disabledReason,
  onAction,
  extraActions,
}: PlacementDocumentPanelProps) {
  const actionButton = (
    <Button
      type="button"
      variant={actionVariant}
      size="editorial-sm"
      className="gap-1.5 shrink-0"
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
  )

  return (
    <div className="flex flex-col gap-3 border border-border/40 bg-muted/10 dark:bg-muted/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <FileCheck className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-heading">{title}</p>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] border",
                statusClassName,
              )}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            {verificationCodeLabel}:{" "}
            <span className="font-mono text-muted-foreground">
              {verificationCode ?? notAvailableLabel}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {extraActions?.map((action, idx) => (
          <Button
            key={idx}
            type="button"
            variant={action.variant}
            size="editorial-sm"
            className="gap-1.5"
            onClick={action.onClick}
            disabled={action.isLoading}
          >
            {action.isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <action.icon className="h-3.5 w-3.5" />
            )}
            {action.label}
          </Button>
        ))}

        {disabledReason ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <span {...props} className="inline-block shrink-0 cursor-not-allowed">
                    {actionButton}
                  </span>
                )}
              />
              <TooltipContent>
                <p>{disabledReason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          actionButton
        )}
      </div>
    </div>
  )
}
