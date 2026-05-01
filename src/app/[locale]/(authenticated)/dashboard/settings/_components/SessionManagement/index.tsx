"use client"

import { LogOut, MonitorSmartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { RevokeConfirmDialog } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/components/RevokeConfirmDialog"
import { SessionCard } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/components/SessionCard"
import { useSessionManagement } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/hooks/useSessionManagement"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function SessionManagement() {
  const t = useTranslations("dashboard.settings.sessions")
  const {
    sessions,
    otherSessions,
    isLoading,
    revokeSession,
    revokeOthers,
    isRevoking,
    isRevokingOthers,
  } = useSessionManagement()

  const [revokeToken, setRevokeToken] = useState<string | null>(null)
  const [showRevokeAll, setShowRevokeAll] = useState(false)

  return (
    <>
      <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
          <MonitorSmartphone className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg text-heading">{t("title")}</h2>
        </div>

        <div className="px-6 py-4 border-b border-border/20">
          <p className="text-sm font-light text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="divide-y divide-border/20">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <Skeleton className="h-8 w-8" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">
              {t("noSessions")}
            </p>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={() => setRevokeToken(session.id)}
                isRevoking={isRevoking}
              />
            ))
          )}
        </div>

        {otherSessions.length > 0 && (
          <div className="px-6 py-4 border-t border-border/40">
            <Button
              type="button"
              variant="editorial-outline"
              size="editorial-sm"
              className="text-destructive hover:text-destructive hover:border-destructive/40"
              onClick={() => setShowRevokeAll(true)}
              disabled={isRevokingOthers}
            >
              <LogOut className="h-3.5 w-3.5 me-1.5" />
              {t("revokeOthers")}
            </Button>
          </div>
        )}
      </div>

      <RevokeConfirmDialog
        open={revokeToken !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeToken(null)
        }}
        mode="single"
        onConfirm={() => {
          const token = revokeToken
          setRevokeToken(null)
          if (token) {
            revokeSession(token).catch(() => {})
          }
        }}
        isLoading={isRevoking}
      />

      <RevokeConfirmDialog
        open={showRevokeAll}
        onOpenChange={setShowRevokeAll}
        mode="all"
        count={otherSessions.length}
        onConfirm={() => {
          setShowRevokeAll(false)
          revokeOthers().catch(() => {})
        }}
        isLoading={isRevokingOthers}
      />
    </>
  )
}
