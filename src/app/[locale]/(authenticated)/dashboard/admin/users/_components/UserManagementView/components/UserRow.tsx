"use client"

import { useTranslations } from "next-intl"
import {
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  ShieldBan,
  KeyRound,
  Trash2,
  Eye,
} from "lucide-react"

import { Link } from "@/i18n/routing"
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
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"

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

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  super_admin: "destructive",
  admin: "default",
  company_admin: "secondary",
  student: "outline",
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
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
            {(user.name?.[0] ?? user.email[0]).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-heading truncate">
              {user.name || "—"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={roleBadgeVariant[user.role ?? ""] ?? "outline"} className="text-[10px]">
          {t(`roles.${user.role ?? "student"}`)}
        </Badge>
      </TableCell>
      <TableCell>
        {user.banned ? (
          <Badge variant="destructive" className="text-[10px]">
            {t("status.banned")}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
            {t("status.active")}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canViewDetails && (
              <DropdownMenuItem
                render={<Link href={`/dashboard/admin/users/${user.id}` as "/dashboard"} />}
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
