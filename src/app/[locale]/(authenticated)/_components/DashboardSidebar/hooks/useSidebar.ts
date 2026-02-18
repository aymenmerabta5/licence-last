"use client"

import { useState, useMemo } from "react"
import { usePathname } from "@/i18n/routing"
import { useLogout } from "@/hooks/useLogout"
import { isSavedOffersEnabledOnClient } from "@/lib/feature-flags-client"
import { navItems } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/constants"

export function useSidebar(role: string) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useLogout()
  const savedOffersEnabled = isSavedOffersEnabledOnClient()

  const filteredItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.labelKey === "savedOffers" && !savedOffersEnabled) {
          return false
        }
        return item.roles.includes(role)
      }),
    [role, savedOffersEnabled]
  )

  return { isCollapsed, setIsCollapsed, filteredItems, pathname, logout }
}
