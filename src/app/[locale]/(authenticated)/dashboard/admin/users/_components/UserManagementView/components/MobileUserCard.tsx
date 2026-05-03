"use client"

import { useTranslations } from "next-intl"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import { UserActionsMenu } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserActionsMenu"
import { UserRoleBadge } from "@/components/UserRoleBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MobileUserCardProps {
  user: AdminUser
  onBan: (user: AdminUser) => void
  onUnban: (userId: string) => void
  onSetRole: (user: AdminUser) => void
  onSetPassword: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
  canModerateUsers: boolean
  canViewDetails: boolean
  canSetRole: boolean
  canSetPassword: boolean
}

export function MobileUserCard({
  user,
  onBan,
  onUnban,
  onSetRole,
  onSetPassword,
  onDelete,
  canModerateUsers,
  canViewDetails,
  canSetRole,
  canSetPassword,
}: MobileUserCardProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const displayRole =
    user.companyMemberRole === "recruiter"
      ? "recruiter"
      : (user.universityMembershipRole ?? user.role)
  const roleLabelKey =
    displayRole === "department_head" ? "dept_head" : (displayRole ?? "student")

  const affiliation = (() => {
    if (user.companyMemberRole === "recruiter" && user.companyName) {
      return user.companyName
    }
    if (user.universityMembershipRole === "department_head") {
      if (user.departmentName && user.universityName) {
        return `${user.departmentName} @ ${user.universityName}`
      }
      return user.departmentName ?? user.universityName ?? null
    }
    if (user.role === "university_admin" && user.universityName) {
      return user.universityName
    }
    if (user.role === "company_admin" && user.companyName) {
      return user.companyName
    }
    if (user.role === "student" && user.universityName) {
      return user.universityName
    }
    return null
  })()

  return (
    <article
      data-testid="mobile-user-card"
      className="border border-border/70 bg-background p-4 shadow-[3px_3px_0_0_oklch(var(--border)_/_0.65)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="h-10 w-10 rounded-sm border border-border/50">
            {user.image && (
              <AvatarImage src={user.image} alt={user.name || user.email} />
            )}
            <AvatarFallback className="rounded-sm bg-accent/50 text-xs font-semibold text-foreground">
              {(user.name?.[0] ?? user.email[0]).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-[13px] font-medium leading-none text-foreground">
              {user.name || "—"}
            </p>
            <p className="break-all text-[11px] leading-relaxed text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <UserActionsMenu
            user={user}
            onBan={onBan}
            onUnban={onUnban}
            onSetRole={onSetRole}
            onSetPassword={onSetPassword}
            onDelete={onDelete}
            canModerateUsers={canModerateUsers}
            canViewDetails={canViewDetails}
            canSetRole={canSetRole}
            canSetPassword={canSetPassword}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border/40 pt-4">
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
            {t("table.role")}
          </p>
          <div className="flex flex-col gap-1.5">
            <UserRoleBadge
              role={displayRole}
              label={t(`roles.${roleLabelKey}`)}
              className="w-fit max-w-full text-[9px] tracking-[0.12em]"
            />
            {affiliation ? (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {affiliation}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
              {t("table.status")}
            </p>
            {user.banned ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-rose-400/60 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                {t("status.banned")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-emerald-400/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                {t("status.active")}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
              {t("table.created")}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
