"use client"

import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

import { useLogout } from "@/hooks/useLogout"

export function OnboardingHeaderActions() {
  const tAuthPanel = useTranslations("auth.panel")
  const { logout, isLoggingOut } = useLogout()

  return (
    <button
      type="button"
      aria-label={tAuthPanel("logoutAria")}
      disabled={isLoggingOut}
      onClick={logout}
      className="inline-flex h-10 w-10 items-center justify-center border border-border/60 bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
    </button>
  )
}
