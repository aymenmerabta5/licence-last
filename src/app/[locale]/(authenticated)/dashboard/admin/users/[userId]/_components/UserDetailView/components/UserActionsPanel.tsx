"use client"

import { useTranslations } from "next-intl"
import { ShieldBan, ShieldOff, LogIn, XCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UserActionsPanelProps {
  isBanned: boolean
  onBan: () => void
  onUnban: () => void
  onRevokeAll: () => void
  onImpersonate: () => void
  isBanPending: boolean
  isUnbanPending: boolean
  isRevokeAllPending: boolean
  isImpersonatePending: boolean
}

export function UserActionsPanel({
  isBanned,
  onBan,
  onUnban,
  onRevokeAll,
  onImpersonate,
  isBanPending,
  isUnbanPending,
  isRevokeAllPending,
  isImpersonatePending,
}: UserActionsPanelProps) {
  const t = useTranslations("dashboard.superAdmin.userDetail")

  return (
    <div className="border border-border/60 bg-white dark:bg-card p-5">
      <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-4">
        {t("actions.title")}
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onImpersonate}
          disabled={isImpersonatePending || isBanned}
          className="gap-2"
        >
          {isImpersonatePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {t("actions.impersonate")}
        </Button>

        {isBanned ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnban}
            disabled={isUnbanPending}
            className="gap-2"
          >
            {isUnbanPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
            {t("actions.unban")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onBan}
            disabled={isBanPending}
            className="gap-2 text-destructive hover:text-destructive"
          >
            {isBanPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldBan className="h-4 w-4" />}
            {t("actions.ban")}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRevokeAll}
          disabled={isRevokeAllPending}
          className="gap-2"
        >
          {isRevokeAllPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
          {t("actions.revokeAll")}
        </Button>
      </div>
    </div>
  )
}
