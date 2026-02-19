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
    <div className="py-4 space-y-2">
      <button
        type="button"
        onClick={onLogout}
        className={cn(
          "flex items-center gap-4 w-full py-3 text-muted-foreground hover:text-heading transition-all duration-500 group",
          isCollapsed ? "justify-center" : "px-6",
        )}
      >
        <LogOut
          className="h-[18px] w-[18px] shrink-0 group-hover:-translate-x-1 group-hover:text-destructive transition-all duration-500"
          strokeWidth={1.5}
        />
        {!isCollapsed && (
          <span className="text-sm font-sans font-medium tracking-wide">
            {t("logout")}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center w-full h-10 text-muted-foreground/40 hover:text-foreground transition-colors"
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
