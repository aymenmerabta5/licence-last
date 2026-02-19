"use client"

import { useQuery } from "@tanstack/react-query"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { orpc } from "@/server/orpc/client"
import { ease, reveal } from "@/lib/animations"

import { useUserManagement } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserManagement"
import { useUserActions } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserActions"
import { useUserDialogState } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserDialogState"
import { UserFilters } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserFilters"
import { UserManagementDialogs } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserManagementDialogs"
import { UsersTable } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UsersTable"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"

export function UserManagementView() {
  const t = useTranslations("dashboard.superAdmin.users")
  const mgmt = useUserManagement()
  const actions = useUserActions()
  const dialogState = useUserDialogState()
  const { data: meResult } = useQuery(orpc.users.getMe.queryOptions())

  const isSuperAdmin = meResult?.user.role === "super_admin"

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            {t("kicker")}
          </p>
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("description")}
          </p>
        </div>
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.5, ease, delay: 0.1 }}>
        <UserFilters
          search={mgmt.search}
          onSearchChange={mgmt.setSearch}
          roleFilter={mgmt.roleFilter}
          onRoleFilterChange={mgmt.setRoleFilter}
          canCreate={isSuperAdmin}
          onCreateClick={() => dialogState.setCreateOpen(true)}
        />
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.5, ease, delay: 0.15 }}>
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
