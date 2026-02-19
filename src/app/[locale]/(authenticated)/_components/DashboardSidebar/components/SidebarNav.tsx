"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { NavItem } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/constants"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

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
                "flex items-center gap-4 py-3 transition-all duration-500 group relative",
                isCollapsed ? "justify-center" : "px-6",
                isActive
                  ? "text-heading"
                  : "text-muted-foreground hover:text-heading",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-all duration-500",
                  isActive ? "text-primary" : "group-hover:-translate-y-[1px]",
                )}
              />

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "text-sm tracking-wide transition-all duration-500",
                    isActive
                      ? "font-serif text-[15px] italic font-bold"
                      : "font-sans font-medium hover:translate-x-1",
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
