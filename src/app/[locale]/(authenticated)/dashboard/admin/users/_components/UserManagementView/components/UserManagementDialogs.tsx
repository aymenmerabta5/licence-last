"use client"

import { BanUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/BanUserDialog"
import { CreateUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/CreateUserDialog"
import { DeleteUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/DeleteUserDialog"
import { SetPasswordDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/SetPasswordDialog"
import { SetRoleDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/SetRoleDialog"
import type { UserActions } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserActions"
import type { UserDialogState } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserDialogState"

interface UserManagementDialogsProps {
  isSuperAdmin: boolean
  dialogState: UserDialogState
  actions: UserActions
}

export function UserManagementDialogs({
  isSuperAdmin,
  dialogState,
  actions,
}: UserManagementDialogsProps) {
  return (
    <>
      {isSuperAdmin && (
        <CreateUserDialog
          open={dialogState.createOpen}
          onOpenChange={dialogState.setCreateOpen}
          onSubmit={(data) => {
            dialogState.setCreateOpen(false)
            actions.createUser.mutate(data)
          }}
          isPending={actions.createUser.isPending}
        />
      )}

      <BanUserDialog
        open={!!dialogState.banTarget}
        onOpenChange={(open) => !open && dialogState.setBanTarget(null)}
        user={dialogState.banTarget}
        onSubmit={(data) => {
          dialogState.setBanTarget(null)
          actions.banUser.mutate(data)
        }}
        isPending={actions.banUser.isPending}
      />

      {isSuperAdmin && (
        <SetRoleDialog
          open={!!dialogState.roleTarget}
          onOpenChange={(open) => !open && dialogState.setRoleTarget(null)}
          user={dialogState.roleTarget}
          onSubmit={(data) => {
            dialogState.setRoleTarget(null)
            actions.setRole.mutate(data)
          }}
          isPending={actions.setRole.isPending}
        />
      )}

      {isSuperAdmin && (
        <SetPasswordDialog
          open={!!dialogState.pwTarget}
          onOpenChange={(open) => !open && dialogState.setPwTarget(null)}
          user={dialogState.pwTarget}
          onSubmit={(data) => {
            dialogState.setPwTarget(null)
            actions.setPassword.mutate(data)
          }}
          isPending={actions.setPassword.isPending}
        />
      )}

      <DeleteUserDialog
        open={!!dialogState.deleteTarget}
        onOpenChange={(open) => !open && dialogState.setDeleteTarget(null)}
        user={dialogState.deleteTarget}
        onConfirm={(userId) => {
          dialogState.setDeleteTarget(null)
          actions.removeUser.mutate({ userId })
        }}
        isPending={actions.removeUser.isPending}
      />
    </>
  )
}
