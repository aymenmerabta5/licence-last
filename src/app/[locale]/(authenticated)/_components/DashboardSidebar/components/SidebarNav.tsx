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
    <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link key={item.href} href={item.href as "/dashboard"}>
            <span
              className={cn(
                "flex items-center gap-3 py-2.5 transition-all duration-200 group relative",
                isCollapsed ? "justify-center px-2" : "px-4",
                isActive
                  ? "text-heading font-bold"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {/* Editorial active accent — thin start border */}
              <div
                className={cn(
                  "absolute inset-y-1 start-0 w-0.5 transition-all duration-200",
                  isActive
                    ? "bg-primary"
                    : "bg-transparent group-hover:bg-primary/20",
                )}
              />

              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-primary",
                )}
              />

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "text-[13px] tracking-wide",
                    isActive
                      ? "font-bold"
                      : "font-medium group-hover:font-semibold",
                  )}
                >
                  {t(item.labelKey)}
                </motion.span>
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
