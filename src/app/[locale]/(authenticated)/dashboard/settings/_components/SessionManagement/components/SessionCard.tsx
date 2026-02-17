"use client"

import { Monitor, Smartphone, Tablet, Globe, Clock } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EnrichedSession } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/types"

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

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const t = useTranslations("dashboard.settings.sessions")
  const DeviceIcon = DEVICE_ICONS[session.parsed.device]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 mt-0.5">
          <DeviceIcon className="h-4 w-4 text-muted-foreground" />
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm">{session.parsed.display}</h4>
            {session.isCurrent && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold uppercase tracking-widest text-[9px] px-2 py-0.5">
                {t("currentDevice")}
              </Badge>
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
          variant="editorial-outline"
          size="editorial-sm"
          className="rounded-xl border-destructive/30 text-destructive/70 hover:bg-destructive/5 ms-13 sm:ms-0 shrink-0"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {t("revoke")}
        </Button>
      )}
    </div>
  )
}
