"use client"

import { useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { AdminUser } from "../types"
import { UserRow } from "./UserRow"

interface UsersTableProps {
  users: AdminUser[]
  isLoading: boolean
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onBan: (user: AdminUser) => void
  onUnban: (userId: string) => void
  onSetRole: (user: AdminUser) => void
  onSetPassword: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
}

export function UsersTable({
  users,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onBan,
  onUnban,
  onSetRole,
  onSetPassword,
  onDelete,
}: UsersTableProps) {
  const t = useTranslations("dashboard.superAdmin.users")

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border border-border/60 bg-white dark:bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.user")}</TableHead>
              <TableHead>{t("table.role")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead>{t("table.created")}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                  {t("noUsers")}
                </td>
              </TableRow>
            ) : (
              users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  onBan={onBan}
                  onUnban={onUnban}
                  onSetRole={onSetRole}
                  onSetPassword={onSetPassword}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t("pagination.showing", {
              from: page * 20 + 1,
              to: Math.min((page + 1) * 20, total),
              total,
            })}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
