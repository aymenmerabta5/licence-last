"use client"

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
          <Link
            key={item.href}
            href={item.href as "/dashboard"}
            prefetch={false}
          >
            <span
              className={cn(
                "flex items-center gap-4 py-2.5 transition-all duration-500 group relative border-s-2",
                isCollapsed
                  ? "justify-center px-2 mx-1 rounded-xl"
                  : "px-5 mx-1.5 rounded-lg",
                isActive
                  ? "border-primary bg-primary/[0.06] text-heading"
                  : "border-transparent text-muted-foreground hover:text-heading hover:bg-muted/30",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-all duration-500",
                  isActive
                    ? "text-primary scale-105"
                    : "group-hover:-translate-y-[1px]",
                )}
              />

              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm tracking-wide transition-all duration-500",
                    isActive
                      ? "font-serif text-[15px] font-semibold"
                      : "font-sans font-medium group-hover:translate-x-1",
                  )}
                >
                  {t(item.labelKey)}
                </span>
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
