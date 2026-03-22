"use client"

import { AlertTriangle, KeyRound, Mail, Shield } from "lucide-react"
import { useState } from "react"
import { ChangePasswordDialog } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ChangePasswordDialog"
import { DeleteAccountDialog } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/DeleteAccountDialog"
import { SessionManagement } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement"
import { TwoFactorSettings } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/TwoFactorSettings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Security Baseline */}
      <Card className="border-border/60 bg-card rounded-[2.5rem] overflow-hidden shadow-sm ring-1 ring-border/5">
        <CardHeader className="relative overflow-hidden px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10 bg-transparent">
          <div
            className="absolute -top-12 -end-8 flex items-center opacity-[0.02] dark:opacity-[0.05] pointer-events-none scale-[2] -rotate-12"
            aria-hidden="true"
          >
            <Shield className="h-64 w-64 text-primary" />
          </div>

          <div className="relative z-10 flex items-center gap-4 mb-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
              <Shield className="h-6 w-6" />
            </span>
            <CardTitle className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">
              Security Baseline
            </CardTitle>
          </div>
          <CardDescription className="relative z-10 text-base font-medium text-muted-foreground/80 sm:ps-16 max-w-xl">
            Key authentication settings. Maintain robust credentials to protect
            your digital perimeter.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-4 sm:px-10 sm:pb-10 sm:pt-6 space-y-0 divide-y divide-border/15">
          {/* Email row */}
          <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 first:pt-0 rounded-xl transition-colors duration-300 hover:bg-muted/40 -mx-2 px-2">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted mt-0.5 transition-colors duration-300 group-hover:bg-primary/[0.08]">
                <Mail className="h-[18px] w-[18px] text-muted-foreground" />
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Primary Email</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Used for login and official notifications.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ps-13 sm:ps-0">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {me?.user.email ?? ""}
              </span>
              <Badge className="bg-primary/8 text-primary border-none font-bold uppercase tracking-widest text-[9px] px-2.5 py-1 shrink-0">
                {me?.user.role ?? "user"}
              </Badge>
            </div>
          </div>

          {/* Password row */}
          <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 rounded-xl transition-colors duration-300 hover:bg-muted/40 -mx-2 px-2">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted mt-0.5 transition-colors duration-300 group-hover:bg-primary/[0.08]">
                <KeyRound className="h-[18px] w-[18px] text-muted-foreground" />
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Password</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Update your password. Other active sessions will be revoked.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="editorial-outline"
              size="editorial-sm"
              className="rounded-xl border-border/40 hover:border-heading ms-13 sm:ms-0"
              onClick={() => setPasswordDialogOpen(true)}
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Auth */}
      <TwoFactorSettings
        isTwoFactorEnabled={me?.user.twoFactorEnabled ?? false}
      />

      {/* Active Sessions */}
      <SessionManagement />

      {/* Danger Zone */}
      <Card className="border-destructive/15 bg-destructive/[0.02] rounded-[2.5rem] overflow-hidden shadow-sm relative group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-destructive)_0%,transparent_50%)] opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]" />

        <div className="relative z-10 px-8 py-8 sm:px-12 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="flex items-start gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive/80 shadow-inner ring-1 ring-destructive/15 transition-all duration-300 group-hover:ring-destructive/30 group-hover:bg-destructive/15">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div className="space-y-1.5 max-w-sm pt-0.5">
              <h4 className="font-serif text-2xl sm:text-3xl tracking-tight text-destructive/90">
                Danger Zone
              </h4>
              <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                Permanently delete your account and all associated data.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="editorial-sm"
            className="rounded-xl h-12 px-8 shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all sm:w-auto w-full font-bold uppercase tracking-widest text-[11px]"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </Card>

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
