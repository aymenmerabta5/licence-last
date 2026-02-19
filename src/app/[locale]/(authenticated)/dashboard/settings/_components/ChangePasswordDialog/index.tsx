"use client"

import { ChangePasswordForm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ChangePasswordDialog/components/ChangePasswordForm"

import { useChangePassword } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ChangePasswordDialog/hooks/useChangePassword"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const { form, serverError, isSuccess, reset } = useChangePassword()

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <ChangePasswordForm
          form={form}
          serverError={serverError}
          isSuccess={isSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
