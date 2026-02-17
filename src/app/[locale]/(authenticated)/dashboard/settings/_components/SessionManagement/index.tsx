"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { MonitorSmartphone, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useSessionManagement } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/hooks/useSessionManagement"
import { SessionCard } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/components/SessionCard"
import { RevokeConfirmDialog } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/components/RevokeConfirmDialog"

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
      <Card className="border-border/40 pt-0 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="relative overflow-hidden px-8 pt-7 pb-5 border-b border-border/15 bg-gradient-to-b from-secondary/10 to-transparent">
          <div
            className="absolute inset-y-0 end-8 flex items-center opacity-[0.03] pointer-events-none"
            aria-hidden="true"
          >
            <MonitorSmartphone className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <MonitorSmartphone className="h-3.5 w-3.5 text-primary" />
            </span>
            <CardTitle className="font-serif text-2xl tracking-tight">
              {t("title")}
            </CardTitle>
          </div>
          <CardDescription className="font-medium ps-10">
            {t("description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-0 divide-y divide-border/15">
          {isLoading ? (
            <div className="space-y-4 py-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">{t("noSessions")}</p>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={() => setRevokeToken(session.token)}
                isRevoking={isRevoking}
              />
            ))
          )}
        </CardContent>

        {otherSessions.length > 0 && (
          <div className="px-8 pb-8 pt-0">
            <Button
              type="button"
              variant="editorial-outline"
              size="editorial-sm"
              className="rounded-xl border-destructive/30 text-destructive/70 hover:bg-destructive/5 w-full sm:w-auto"
              onClick={() => setShowRevokeAll(true)}
              disabled={isRevokingOthers}
            >
              <LogOut className="h-3.5 w-3.5 me-2" />
              {t("revokeOthers")}
            </Button>
          </div>
        )}
      </Card>

      {/* Single session revoke dialog */}
      <RevokeConfirmDialog
        open={revokeToken !== null}
        onOpenChange={(open) => { if (!open) setRevokeToken(null) }}
        mode="single"
        onConfirm={async () => {
          if (revokeToken) {
            await revokeSession(revokeToken)
            setRevokeToken(null)
          }
        }}
        isLoading={isRevoking}
      />

      {/* Revoke all others dialog */}
      <RevokeConfirmDialog
        open={showRevokeAll}
        onOpenChange={setShowRevokeAll}
        mode="all"
        count={otherSessions.length}
        onConfirm={async () => {
          await revokeOthers()
          setShowRevokeAll(false)
        }}
        isLoading={isRevokingOthers}
      />
    </>
  )
}
