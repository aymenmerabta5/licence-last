"use client"

import {
  AlertTriangle,
  KeyRound,
  Mail,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { ChangePasswordDialog } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ChangePasswordDialog"
import { DeleteAccountDialog } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/DeleteAccountDialog"
import { SessionManagement } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement"
import { TwoFactorSettings } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings"
import { Button } from "@/components/ui/button"

interface AccountSettingsTabProps {
  me:
    | {
        user: {
          email: string
          role: string | null | undefined
          twoFactorEnabled?: boolean
        }
      }
    | undefined
}

export function AccountSettingsTab({ me }: AccountSettingsTabProps) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <div className="space-y-8">
      {/* Security Baseline */}
      <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg text-heading">Security Baseline</h2>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm font-light text-muted-foreground">
            Key authentication settings. Maintain robust credentials to protect
            your digital perimeter.
          </p>
        </div>

        <div className="divide-y divide-border/20">
          {/* Email row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30 mt-0.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-heading">
                  Primary Email
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Used for login and official notifications.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ps-11 sm:ps-0">
              <span className="text-sm font-medium truncate max-w-full sm:max-w-[200px]">
                {me?.user.email ?? ""}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] border border-primary/30 bg-primary/10 text-primary">
                {me?.user.role ?? "user"}
              </span>
            </div>
          </div>

          {/* Password row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30 mt-0.5">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-heading">Password</h4>
                <p className="text-[11px] text-muted-foreground">
                  Update your password. Other active sessions will be revoked.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="editorial-outline"
              size="editorial-sm"
              className="ms-11 sm:ms-0"
              onClick={() => setPasswordDialogOpen(true)}
            >
              Update
            </Button>
          </div>

          {/* Two-Factor Auth row */}
          <TwoFactorSettings
            isTwoFactorEnabled={me?.user.twoFactorEnabled ?? false}
          />
        </div>
      </div>

      {/* Active Sessions */}
      <SessionManagement />

      {/* Danger Zone */}
      <div className="border border-destructive/20 dark:border-destructive/15 overflow-hidden">
        <div className="h-0.5 bg-destructive/40" />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-serif text-lg tracking-tight text-heading">
                Danger Zone
              </h3>
              <p className="text-sm font-light text-muted-foreground">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="shrink-0"
          >
            Delete Account
          </Button>
        </div>
      </div>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}
