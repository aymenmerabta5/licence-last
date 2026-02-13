"use client"

import * as motion from "motion/react-client"
import { cn } from "@/lib/utils"
import { useSidebar } from "./hooks/useSidebar"
import { SidebarHeader } from "./components/SidebarHeader"
import { SidebarNav } from "./components/SidebarNav"
import { SidebarFooter } from "./components/SidebarFooter"

export function DashboardSidebar({ role = "student" }: { role?: string }) {
  const { isCollapsed, setIsCollapsed, filteredItems, pathname, logout } = useSidebar(role)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "relative sticky top-0 h-screen flex flex-col border-e border-border/50 bg-background transition-colors duration-500",
        "z-30"
      )}
    >
      <SidebarHeader isCollapsed={isCollapsed} />
      <SidebarNav items={filteredItems} pathname={pathname} isCollapsed={isCollapsed} />
      <SidebarFooter
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        onLogout={logout}
      />
    </motion.aside>
  )
}
