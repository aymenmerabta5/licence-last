"use client"

import { Clock, Globe, Monitor, Smartphone, Tablet } from "lucide-react"
import { useTranslations } from "next-intl"
import type { EnrichedSession } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/types"
import { Button } from "@/components/ui/button"

interface SessionCardProps {
  session: EnrichedSession
  onRevoke: () => void
  isRevoking: boolean
}

const DEVICE_ICONS = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
} as const

function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minutes = Math.floor(diff / 60_000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  return new Date(date).toLocaleDateString()
}

export function SessionCard({
  session,
  onRevoke,
  isRevoking,
}: SessionCardProps) {
  const t = useTranslations("dashboard.settings.sessions")
  const DeviceIcon = DEVICE_ICONS[session.parsed.device]

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-primary/[0.02]">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30 group-hover:border-primary/20 transition-colors mt-0.5">
          <DeviceIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-heading">
              {session.parsed.display}
            </h4>
            {session.isCurrent && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] border border-emerald-400/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                {t("currentDevice")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {session.ipAddress && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {session.ipAddress}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("lastActive")} {formatRelativeTime(session.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {!session.isCurrent && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ms-11 sm:ms-0"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {t("revoke")}
        </Button>
      )}
    </div>
  )
}
