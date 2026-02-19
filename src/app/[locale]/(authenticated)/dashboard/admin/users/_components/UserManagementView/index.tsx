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
import { ease, reveal } from "@/lib/animations"
import { orpc } from "@/server/orpc/client"

export function UserManagementView() {
  const t = useTranslations("dashboard.superAdmin.users")
  const mgmt = useUserManagement()
  const actions = useUserActions()
  const dialogState = useUserDialogState()
  const { data: meResult } = useQuery(orpc.users.getMe.queryOptions())

  const isSuperAdmin = meResult?.user.role === "super_admin"

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <header className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
            {t("kicker")}
          </p>
          <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
            {t("description")}
          </p>
        </header>
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
