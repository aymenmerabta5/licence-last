"use client"

import { Clock, Globe, Monitor, Smartphone, Tablet } from "lucide-react"
import { useTranslations } from "next-intl"
import type { EnrichedSession } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/types"
import { Badge } from "@/components/ui/badge"
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
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 my-2.5 rounded-[1.5rem] transition-all duration-300 hover:bg-muted/40 hover:shadow-sm border border-transparent hover:border-border/10">
      <div className="flex items-start gap-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted shadow-inner group-hover:bg-primary/[0.08] group-hover:scale-105 transition-all duration-500">
          <DeviceIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </span>
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center gap-3">
            <h4 className="font-serif text-lg tracking-tight text-heading">
              {session.parsed.display}
            </h4>
            {session.isCurrent && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-sm">
                {t("currentDevice")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80">
            {session.ipAddress && (
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {session.ipAddress}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {t("lastActive")} {formatRelativeTime(session.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {!session.isCurrent && (
        <Button
          type="button"
          variant="destructive"
          size="editorial-sm"
          className="rounded-xl h-10 px-5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md shadow-destructive/20 hover:shadow-destructive/40 ms-17 sm:ms-0 shrink-0 font-bold text-xs"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {t("revoke")}
        </Button>
      )}
    </div>
  )
}
