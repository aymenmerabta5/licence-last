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
import { Badge } from "@/components/ui/badge"
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
  canViewDetails,
  canSetRole,
  canSetPassword,
}: UserRowProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const hasAdminOnlyActions = canViewDetails || canSetRole || canSetPassword

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
        <UserRoleBadge
          role={user.role}
          label={t(`roles.${user.role ?? "student"}`)}
        />
      </TableCell>
      <TableCell className="py-4">
        {user.banned ? (
          <Badge
            variant="destructive"
            className="text-[9px] uppercase tracking-wider font-semibold rounded-sm px-2 py-0.5"
          >
            {t("status.banned")}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[9px] uppercase tracking-wider font-semibold rounded-sm px-2 py-0.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"
          >
            {t("status.active")}
          </Badge>
        )}
      </TableCell>
      <TableCell className="py-4 text-[11px] text-muted-foreground font-medium">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="py-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
            {hasAdminOnlyActions && <DropdownMenuSeparator />}
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
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
