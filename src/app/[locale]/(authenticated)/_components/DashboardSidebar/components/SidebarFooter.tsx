"use client"

import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface SidebarFooterProps {
  isCollapsed: boolean
  onToggle: () => void
  onLogout: () => void
}

export function SidebarFooter({
  isCollapsed,
  onToggle,
  onLogout,
}: SidebarFooterProps) {
  const t = useTranslations("dashboard.nav")

  return (
    <div className="px-3 py-4 border-t border-border/40 space-y-1">
      <button
        onClick={onLogout}
        className={cn(
          "flex items-center gap-3 w-full px-4 py-2.5 text-muted-foreground hover:text-destructive transition-all duration-200 group",
          isCollapsed && "justify-center px-2",
        )}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0 group-hover:text-destructive transition-colors" />
        {!isCollapsed && (
          <span className="text-[13px] font-medium tracking-wide">
            {t("logout")}
          </span>
        )}
      </button>

      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center w-full h-8 text-muted-foreground/40 hover:text-foreground transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
