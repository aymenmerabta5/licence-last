"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { SessionsTable } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/components/SessionsTable"
import { UserActionsPanel } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/components/UserActionsPanel"
import { UserInfoCard } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/components/UserInfoCard"
import { useImpersonation } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/hooks/useImpersonation"
import { useUserDetail } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/hooks/useUserDetail"
import { useUserDetailActions } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView/hooks/useUserDetailActions"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

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
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-sm text-muted-foreground">{t("notFound")}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/admin/users" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToUsers")}
        </Link>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            {t("kicker")}
          </p>
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {user.name || user.email}
          </h1>
        </div>
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.5, ease, delay: 0.1 }}>
        <UserInfoCard user={user} />
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.5, ease, delay: 0.15 }}>
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

      <motion.div {...reveal} transition={{ duration: 0.5, ease, delay: 0.2 }}>
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
