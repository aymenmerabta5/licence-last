"use client"

import { useState } from "react"
import { AlertTriangle, KeyRound, Mail, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { ChangePasswordDialog } from "./ChangePasswordDialog"
import { TwoFactorSettings } from "./TwoFactorSettings"

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Security Baseline */}
      <Card className="border-border/40 pt-0 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="relative overflow-hidden px-8 pt-7 pb-5 border-b border-border/15 bg-gradient-to-b from-secondary/10 to-transparent">
          <div
            className="absolute inset-y-0 end-8 flex items-center opacity-[0.03] pointer-events-none"
            aria-hidden="true"
          >
            <Shield className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </span>
            <CardTitle className="font-serif text-2xl tracking-tight">
              Security Baseline
            </CardTitle>
          </div>
          <CardDescription className="font-medium ps-10">
            Keep your account secure with strong credentials and two-factor authentication.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-0 divide-y divide-border/15">
          {/* Email row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 first:pt-0">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 mt-0.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm">Primary Email</h4>
                <p className="text-[11px] text-muted-foreground">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 mt-0.5">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm">Password</h4>
                <p className="text-[11px] text-muted-foreground">
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
      <TwoFactorSettings isTwoFactorEnabled={me?.user.twoFactorEnabled ?? false} />

      {/* Danger Zone */}
      <Card className="border-destructive/15 bg-destructive/[0.03] rounded-3xl overflow-hidden">
        <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 mt-0.5">
              <AlertTriangle className="h-4 w-4 text-destructive/70" />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-destructive/80">Danger Zone</h4>
              <p className="text-[11px] text-muted-foreground">
                Permanently delete your account. This action cannot be undone.
              </p>
            </div>
          </div>
          <Button
            type="button"
            disabled
            variant="editorial-outline"
            size="editorial-sm"
            className="rounded-xl border-destructive/30 text-destructive/60 hover:bg-destructive/5 ms-13 sm:ms-0"
          >
            Delete Account
          </Button>
        </div>
      </Card>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  )
}
