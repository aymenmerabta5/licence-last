"use client"

import { Loader2, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { MobileUserCard } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/MobileUserCard"
import { UserRow } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserRow"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UsersTableProps {
  users: AdminUser[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  sentinelRef: React.RefObject<HTMLDivElement | null>
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

export function UsersTable({
  users,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  sentinelRef,
  onBan,
  onUnban,
  onSetRole,
  onSetPassword,
  onDelete,
  canModerateUsers,
  canViewDetails,
  canSetRole,
  canSetPassword,
}: UsersTableProps) {
  const t = useTranslations("dashboard.superAdmin.users")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading users
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="border border-border/80 bg-background px-4 py-16 shadow-[4px_4px_0_0_oklch(var(--border))] sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
              <Users className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <p className="font-serif text-lg text-heading">{t("noUsers")}</p>
              <p className="text-sm font-light text-muted-foreground">
                No users match the current filters.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <MobileUserCard
                key={u.id}
                user={u}
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
            ))}
          </div>

          <div className="hidden border border-border/80 bg-background shadow-[4px_4px_0_0_oklch(var(--border))] md:block">
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-border/80">
                    <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-12">
                      {t("table.user")}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-12">
                      {t("table.role")}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-12">
                      {t("table.status")}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-12">
                      {t("table.created")}
                    </TableHead>
                    <TableHead className="w-[50px] h-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-6"
        >
          {isFetchingNextPage && (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          )}
        </div>
      )}
    </div>
  )
}
