"use client"

import { Loader2, LogIn, ShieldBan, ShieldOff, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
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
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {t("actions.title")}
        </h3>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="editorial-outline"
            size="editorial-sm"
            onClick={onImpersonate}
            disabled={isImpersonatePending || isBanned}
            className="gap-2"
          >
            {isImpersonatePending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogIn className="h-3.5 w-3.5" />
            )}
            {t("actions.impersonate")}
          </Button>

          {isBanned ? (
            <Button
              variant="editorial-outline"
              size="editorial-sm"
              onClick={onUnban}
              disabled={isUnbanPending}
              className="gap-2"
            >
              {isUnbanPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldOff className="h-3.5 w-3.5" />
              )}
              {t("actions.unban")}
            </Button>
          ) : (
            <Button
              variant="editorial-outline"
              size="editorial-sm"
              onClick={onBan}
              disabled={isBanPending}
              className="gap-2 text-destructive hover:text-destructive hover:border-destructive/40"
            >
              {isBanPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldBan className="h-3.5 w-3.5" />
              )}
              {t("actions.ban")}
            </Button>
          )}

          <Button
            variant="editorial-outline"
            size="editorial-sm"
            onClick={onRevokeAll}
            disabled={isRevokeAllPending}
            className="gap-2"
          >
            {isRevokeAllPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {t("actions.revokeAll")}
          </Button>
        </div>
      </div>
    </div>
  )
}
