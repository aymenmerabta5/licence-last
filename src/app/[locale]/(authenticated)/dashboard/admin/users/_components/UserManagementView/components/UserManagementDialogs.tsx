"use client"

import { BanUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/BanUserDialog"
import { CreateUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/CreateUserDialog"
import { DeleteUserDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/DeleteUserDialog"
import { SetPasswordDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/SetPasswordDialog"
import { SetRoleDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/SetRoleDialog"
import type { UserDialogState } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserDialogState"
import type { UserActions } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/hooks/useUserActions"

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
            actions.createUser.mutate(data, {
              onSuccess: () => dialogState.setCreateOpen(false),
            })
          }}
          isPending={actions.createUser.isPending}
        />
      )}

      <BanUserDialog
        open={!!dialogState.banTarget}
        onOpenChange={(open) => !open && dialogState.setBanTarget(null)}
        user={dialogState.banTarget}
        onSubmit={(data) => {
          actions.banUser.mutate(data, {
            onSuccess: () => dialogState.setBanTarget(null),
          })
        }}
        isPending={actions.banUser.isPending}
      />

      {isSuperAdmin && (
        <SetRoleDialog
          open={!!dialogState.roleTarget}
          onOpenChange={(open) => !open && dialogState.setRoleTarget(null)}
          user={dialogState.roleTarget}
          onSubmit={(data) => {
            actions.setRole.mutate(data, {
              onSuccess: () => {
                actions.updateUser.mutate({
                  userId: data.userId,
                  role: data.role,
                })
                dialogState.setRoleTarget(null)
              },
            })
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
            actions.setPassword.mutate(data, {
              onSuccess: () => dialogState.setPwTarget(null),
            })
          }}
          isPending={actions.setPassword.isPending}
        />
      )}

      <DeleteUserDialog
        open={!!dialogState.deleteTarget}
        onOpenChange={(open) => !open && dialogState.setDeleteTarget(null)}
        user={dialogState.deleteTarget}
        onConfirm={(userId) => {
          actions.removeUser.mutate(
            { userId },
            { onSuccess: () => dialogState.setDeleteTarget(null) },
          )
        }}
        isPending={actions.removeUser.isPending}
      />
    </>
  )
}
