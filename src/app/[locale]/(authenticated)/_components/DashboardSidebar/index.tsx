"use client"

import * as motion from "motion/react-client"
import { SidebarFooter } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/components/SidebarFooter"
import { SidebarHeader } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/components/SidebarHeader"
import { SidebarNav } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/components/SidebarNav"
import { useSidebar } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/hooks/useSidebar"
import { cn } from "@/lib/utils"

export function DashboardSidebar({ role = "student" }: { role?: string }) {
  const { isCollapsed, setIsCollapsed, filteredItems, pathname, logout } =
    useSidebar(role)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        "relative sticky top-0 h-screen flex flex-col bg-background transition-all duration-500 ease-in-out",
        "z-30",
      )}
    >
      {/* Subtle border instead of full border-e class */}
      <div className="absolute top-0 end-0 bottom-0 w-px bg-border/10" />

      <SidebarHeader isCollapsed={isCollapsed} />

      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar relative z-10">
        <SidebarNav
          items={filteredItems}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />
      </div>

      <div className="mb-6 relative z-10">
        <SidebarFooter
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onLogout={logout}
        />
      </div>
    </motion.aside>
  )
}
