"use client"

import { ArrowLeft, Loader2, UserX } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { SessionsTable } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/components/SessionsTable"
import { UserActionsPanel } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/components/UserActionsPanel"
import { UserInfoCard } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/components/UserInfoCard"
import { useImpersonation } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/hooks/useImpersonation"
import { useUserDetail } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/hooks/useUserDetail"
import { useUserDetailActions } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/hooks/useUserDetailActions"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

interface UserDetailViewProps {
  userId: string
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const t = useTranslations("dashboard.superAdmin.userDetail")
  const { user, sessions, isLoading, sessionsLoading } = useUserDetail(userId)
  const actions = useUserDetailActions()
  const impersonation = useImpersonation()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading user details
        </span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto border border-dashed border-border/60 p-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <UserX className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <p className="font-serif text-lg text-heading">{t("notFound")}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease }}
          className="h-0.5 bg-primary"
        />

        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Link
            href={"/dashboard/admin/users" as "/dashboard"}
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            {t("backToUsers")}
          </Link>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-3"
        >
          <Badge variant="editorial-muted">{t("kicker")}</Badge>
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            {user.name || user.email}
          </h1>
        </motion.div>
      </header>

      <motion.div {...reveal} transition={revealWithDelay(0.15)}>
        <UserInfoCard user={user} />
      </motion.div>

      <motion.div {...reveal} transition={revealWithDelay(0.2)}>
        <UserActionsPanel
          isBanned={!!user.banned}
          onBan={() => actions.banUser.mutate({ userId: user.id })}
          onUnban={() => actions.unbanUser.mutate(user.id)}
          onRevokeAll={() => actions.revokeAllSessions.mutate(user.id)}
          onImpersonate={() => impersonation.impersonate(user.id)}
          isBanPending={actions.banUser.isPending}
          isUnbanPending={actions.unbanUser.isPending}
          isRevokeAllPending={actions.revokeAllSessions.isPending}
          isImpersonatePending={impersonation.isPending}
        />
      </motion.div>

      <motion.div {...reveal} transition={revealWithDelay(0.25)}>
        <SessionsTable
          sessions={sessions}
          isLoading={sessionsLoading}
          onRevoke={(token) => actions.revokeSession.mutate(token)}
          isRevoking={actions.revokeSession.isPending}
        />
      </motion.div>
    </div>
  )
}
