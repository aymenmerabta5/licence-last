"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { reveal, ease } from "@/lib/animations"
import { orpc } from "@/server/orpc/client"

import { useUserManagement } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserManagement"
import { useUserActions } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserActions"
import { UserFilters } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UserFilters"
import { UsersTable } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/UsersTable"
import { CreateUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/CreateUserDialog"
import { BanUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/BanUserDialog"
import { SetRoleDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/SetRoleDialog"
import { SetPasswordDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/SetPasswordDialog"
import { DeleteUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/DeleteUserDialog"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"

export function UserManagementView() {
  const t = useTranslations("dashboard.superAdmin.users")
  const mgmt = useUserManagement()
  const actions = useUserActions()
  const { data: meResult } = useQuery(orpc.users.getMe.queryOptions())

  const [createOpen, setCreateOpen] = useState(false)
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [pwTarget, setPwTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
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
          onCreateClick={() => setCreateOpen(true)}
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
          onBan={setBanTarget}
          onUnban={(userId) => actions.unbanUser.mutate({ userId })}
          onSetRole={setRoleTarget}
          onSetPassword={setPwTarget}
          onDelete={setDeleteTarget}
          canViewDetails={isSuperAdmin}
          canSetRole={isSuperAdmin}
          canSetPassword={isSuperAdmin}
        />
      </motion.div>

      {isSuperAdmin && (
        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={(data) => {
            actions.createUser.mutate(data, { onSuccess: () => setCreateOpen(false) })
          }}
          isPending={actions.createUser.isPending}
        />
      )}

      <BanUserDialog
        open={!!banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        user={banTarget}
        onSubmit={(data) => {
          actions.banUser.mutate(data, { onSuccess: () => setBanTarget(null) })
        }}
        isPending={actions.banUser.isPending}
      />

      {isSuperAdmin && (
        <SetRoleDialog
          open={!!roleTarget}
          onOpenChange={(open) => !open && setRoleTarget(null)}
          user={roleTarget}
          onSubmit={(data) => {
            actions.setRole.mutate(data, { onSuccess: () => setRoleTarget(null) })
          }}
          isPending={actions.setRole.isPending}
        />
      )}

      {isSuperAdmin && (
        <SetPasswordDialog
          open={!!pwTarget}
          onOpenChange={(open) => !open && setPwTarget(null)}
          user={pwTarget}
          onSubmit={(data) => {
            actions.setPassword.mutate(data, { onSuccess: () => setPwTarget(null) })
          }}
          isPending={actions.setPassword.isPending}
        />
      )}

      <DeleteUserDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        user={deleteTarget}
        onConfirm={(userId) => {
          actions.removeUser.mutate({ userId }, { onSuccess: () => setDeleteTarget(null) })
        }}
        isPending={actions.removeUser.isPending}
      />
    </div>
  )
}
