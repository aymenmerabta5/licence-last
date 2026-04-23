"use client"

import {
  Eye,
  KeyRound,
  MoreHorizontal,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import { UserRoleBadge } from "@/components/UserRoleBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import { Link } from "@/i18n/routing"

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
  const hasAdminOnlyActions =
    canViewDetails || canSetRole || canSetPassword || canModerateUsers

  const displayRole = user.universityMembershipRole ?? user.role
  const roleLabelKey =
    displayRole === "department_head" ? "dept_head" : (displayRole ?? "student")

  const affiliation = (() => {
    if (user.universityMembershipRole === "department_head") {
      if (user.departmentName && user.universityName) {
        return `${user.departmentName} @ ${user.universityName}`
      }
      return user.departmentName ?? user.universityName ?? null
    }
    if (user.role === "university_admin" && user.universityName) {
      return user.universityName
    }
    return null
  })()

  return (
    <TableRow className="group hover:bg-primary/[0.02] border-b border-border/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 bg-accent/50 border border-border/50 flex items-center justify-center text-xs font-semibold text-foreground shrink-0 rounded-sm">
            {(user.name?.[0] ?? user.email[0]).toUpperCase()}
          </div>
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
        {hasAdminOnlyActions && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {canViewDetails && (
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/dashboard/admin/users/${user.id}` as "/dashboard"}
                    />
                  }
                >
                  <Eye className="h-4 w-4 me-2" />
                  {t("actions.view")}
                </DropdownMenuItem>
              )}
              {canSetRole && (
                <DropdownMenuItem onClick={() => onSetRole(user)}>
                  <ShieldCheck className="h-4 w-4 me-2" />
                  {t("actions.setRole")}
                </DropdownMenuItem>
              )}
              {canSetPassword && (
                <DropdownMenuItem onClick={() => onSetPassword(user)}>
                  <KeyRound className="h-4 w-4 me-2" />
                  {t("actions.setPassword")}
                </DropdownMenuItem>
              )}
              {(canViewDetails || canSetRole || canSetPassword) && canModerateUsers && (
                <DropdownMenuSeparator />
              )}
              {canModerateUsers && (
                <>
                  {user.banned ? (
                    <DropdownMenuItem onClick={() => onUnban(user.id)}>
                      <ShieldOff className="h-4 w-4 me-2" />
                      {t("actions.unban")}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onBan(user)}>
                      <ShieldBan className="h-4 w-4 me-2" />
                      {t("actions.ban")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t("actions.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  )
}
