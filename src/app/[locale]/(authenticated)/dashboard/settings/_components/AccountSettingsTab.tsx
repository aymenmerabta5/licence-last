"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AccountSettingsTabProps {
  me:
    | {
        user: {
          email: string
          role: string | null | undefined
        }
      }
    | undefined
}

export function AccountSettingsTab({ me }: AccountSettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="p-8">
          <CardTitle className="font-serif text-2xl">Security Baseline</CardTitle>
          <CardDescription className="font-medium">
            Keep your account secure by following best practices.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <div className="flex items-center justify-between gap-10">
            <div className="space-y-1">
              <h4 className="font-bold">Primary Email</h4>
              <p className="text-xs text-muted-foreground">Used for login and official notifications.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{me?.user.email ?? ""}</span>
              <Badge className="bg-secondary/50 text-foreground border-none font-bold uppercase tracking-widest text-[9px] px-2 py-1">
                {me?.user.role ?? "user"}
              </Badge>
            </div>
          </div>

          <div className="h-px bg-border/20" />

          <div className="flex items-center justify-between gap-10 opacity-60">
            <div className="space-y-1">
              <h4 className="font-bold">Security Password</h4>
              <p className="text-xs text-muted-foreground italic">Password change is coming soon.</p>
            </div>
            <Button
              type="button"
              disabled
              variant="editorial-outline"
              className="rounded-xl h-11 border-border/40 hover:border-heading"
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5 rounded-3xl p-8 space-y-4 opacity-60">
        <h4 className="font-bold text-destructive">Termination Zone</h4>
        <p className="text-sm text-destructive/70 font-medium">
          Account deletion is not available yet.
        </p>
        <Button
          type="button"
          disabled
          variant="editorial"
          className="bg-destructive hover:bg-destructive/90 text-white rounded-xl h-11 px-8"
        >
          Delete Account
        </Button>
      </Card>
    </div>
  )
}
