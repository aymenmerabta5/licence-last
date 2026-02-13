"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type { NavItem } from "../constants"

interface SidebarNavProps {
  items: NavItem[]
  pathname: string
  isCollapsed: boolean
}

export function SidebarNav({ items, pathname, isCollapsed }: SidebarNavProps) {
  const t = useTranslations("dashboard.nav")

  return (
    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const isActive = item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link key={item.href} href={item.href as "/dashboard"}>
            <span
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 transition-all duration-300 group relative",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm tracking-wide"
                >
                  {t(item.labelKey)}
                </motion.span>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute start-0 w-1 h-6 bg-primary rounded-e-full"
                />
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
