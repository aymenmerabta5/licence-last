"use client"

import { useTranslations } from "next-intl"
import { UserActionsMenu } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserActionsMenu"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import { isUserPending } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import { UserRoleBadge } from "@/components/UserRoleBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TableCell, TableRow } from "@/components/ui/table"

interface UserRowProps {
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

export function UserRow({
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
}: UserRowProps) {
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
    <TableRow className="group hover:bg-primary/[0.02] border-b border-border/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 rounded-full border border-border/50">
            {user.image && (
              <AvatarImage src={user.image} alt={user.name || user.email} />
            )}
            <AvatarFallback className="rounded-full bg-accent/50 text-xs font-semibold text-foreground">
              {(user.name?.[0] ?? user.email[0]).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex flex-col justify-center">
            <p className="text-[13px] font-medium text-foreground truncate leading-none mb-1.5 group-hover:text-primary transition-colors">
              {user.name || "—"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-none">
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col gap-0.5">
          <UserRoleBadge
            role={displayRole}
            label={t(`roles.${roleLabelKey}`)}
          />
          {affiliation && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
              {affiliation}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        {user.banned ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-rose-400/60 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
            {t("status.banned")}
          </span>
        ) : isUserPending(user) ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-amber-400/60 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            {t("status.pending")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-emerald-400/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            {t("status.active")}
          </span>
        )}
      </TableCell>
      <TableCell className="py-4 text-[11px] text-muted-foreground font-medium">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="py-4">
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
      </TableCell>
    </TableRow>
  )
}
