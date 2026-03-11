"use client"

import { LogOut, MonitorSmartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { RevokeConfirmDialog } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/components/RevokeConfirmDialog"
import { SessionCard } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/components/SessionCard"
import { useSessionManagement } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/hooks/useSessionManagement"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        <Card className="border-border/60 bg-background/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-sm shadow-black/5 ring-1 ring-border/10">
          <CardHeader className="relative overflow-hidden px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10 bg-gradient-to-b from-muted/80 via-muted/30 to-transparent">
            <div
              className="absolute -top-12 -right-8 flex items-center opacity-[0.02] dark:opacity-[0.05] pointer-events-none scale-[2] rotate-12"
              aria-hidden="true"
            >
              <MonitorSmartphone className="h-64 w-64 text-primary" />
            </div>

            <div className="relative z-10 flex items-center gap-4 mb-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                <MonitorSmartphone className="h-6 w-6" />
              </span>
              <CardTitle className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">
                {t("title")}
              </CardTitle>
            </div>
            <CardDescription className="relative z-10 text-base font-medium text-muted-foreground/80 sm:ps-16 max-w-xl">
              {t("description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4 sm:px-12 sm:pb-12 sm:pt-6 space-y-0 divide-y divide-border/15">
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
              <p className="text-sm text-muted-foreground py-4">
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
      </div>

      {/* Single session revoke dialog */}
      <RevokeConfirmDialog
        open={revokeToken !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeToken(null)
        }}
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
