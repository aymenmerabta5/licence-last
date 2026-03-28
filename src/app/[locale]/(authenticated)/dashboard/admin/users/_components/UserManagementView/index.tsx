"use client"

import { useQuery } from "@tanstack/react-query"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { UserFilters } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserFilters"
import { UserManagementDialogs } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserManagementDialogs"
import { UsersTable } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UsersTable"
import { useUserActions } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserActions"
import { useUserDialogState } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserDialogState"
import { useUserManagement } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserManagement"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { orpc } from "@/server/orpc/client"

export function UserManagementView() {
  const t = useTranslations("dashboard.superAdmin.users")
  const mgmt = useUserManagement()
  const actions = useUserActions(mgmt.refetch)
  const dialogState = useUserDialogState()
  const { data: meResult } = useQuery(orpc.users.getMe.queryOptions())

  const isSuperAdmin = meResult?.user.role === "super_admin"

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease }}
          className="h-0.5 bg-primary"
        />

        <div className="space-y-3">
          <motion.div {...reveal} transition={revealWithDelay(0.05)}>
            <Badge variant="editorial-muted">{t("kicker")}</Badge>
          </motion.div>

          <motion.div
            {...reveal}
            transition={revealWithDelay(0.1)}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-2">
              <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
                {t("title")}
              </h1>
              <p className="text-sm font-light tracking-wide text-muted-foreground max-w-2xl">
                {t("description")}
              </p>
            </div>

            {mgmt.total > 0 && (
              <div className="shrink-0 flex items-center gap-2 border-s border-border/40 ps-6">
                <span className="font-serif text-3xl text-heading tracking-tight">
                  {mgmt.total}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Users
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      <motion.div {...reveal} transition={revealWithDelay(0.15)}>
        <UserFilters
          search={mgmt.search}
          onSearchChange={mgmt.setSearch}
          roleFilter={mgmt.roleFilter}
          onRoleFilterChange={mgmt.setRoleFilter}
          canCreate={isSuperAdmin}
          onCreateClick={() => dialogState.setCreateOpen(true)}
        />
      </motion.div>

      <motion.div {...reveal} transition={revealWithDelay(0.2)}>
        <UsersTable
          users={mgmt.users as AdminUser[]}
          isLoading={mgmt.isLoading}
          page={mgmt.page}
          totalPages={mgmt.totalPages}
          total={mgmt.total}
          onPageChange={mgmt.setPage}
          onBan={dialogState.setBanTarget}
          onUnban={(userId) => actions.unbanUser.mutate({ userId })}
          onSetRole={dialogState.setRoleTarget}
          onSetPassword={dialogState.setPwTarget}
          onDelete={dialogState.setDeleteTarget}
          canViewDetails={isSuperAdmin}
          canSetRole={isSuperAdmin}
          canSetPassword={isSuperAdmin}
        />
      </motion.div>

      <UserManagementDialogs
        isSuperAdmin={isSuperAdmin}
        dialogState={dialogState}
        actions={actions}
      />
    </div>
  )
}
