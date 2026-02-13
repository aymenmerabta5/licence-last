"use client"

import { useTranslations } from "next-intl"
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarFooterProps {
  isCollapsed: boolean
  onToggle: () => void
  onLogout: () => void
}

export function SidebarFooter({ isCollapsed, onToggle, onLogout }: SidebarFooterProps) {
  const t = useTranslations("dashboard.nav")

  return (
    <div className="p-4 border-t border-border/50 space-y-2">
      <button
        onClick={onLogout}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-300",
          isCollapsed && "justify-center"
        )}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="text-sm font-medium">{t("logout")}</span>}
      </button>

      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center w-full h-8 text-muted-foreground/50 hover:text-foreground transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  )
}
