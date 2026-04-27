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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"

interface UserActionsMenuProps {
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

export function UserActionsMenu({
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
}: UserActionsMenuProps) {
  const t = useTranslations("dashboard.superAdmin.users")

  if (!(canViewDetails || canSetRole || canSetPassword || canModerateUsers)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Open user actions"
          />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {canViewDetails && (
          <DropdownMenuItem
            render={
              <Link href={`/dashboard/admin/users/${user.id}` as "/dashboard"} />
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
  )
}