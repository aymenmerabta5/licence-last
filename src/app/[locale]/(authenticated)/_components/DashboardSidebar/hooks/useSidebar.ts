"use client"

import { useMemo, useState } from "react"
import { navItems } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/constants"
import { useLogout } from "@/hooks/useLogout"
import { usePathname } from "@/i18n/routing"
import {
  isInterviewsEnabledOnClient,
  isSavedOffersEnabledOnClient,
} from "@/lib/feature-flags-client"

export function useSidebar(role: string) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useLogout()
  const savedOffersEnabled = isSavedOffersEnabledOnClient()
  const interviewsEnabled = isInterviewsEnabledOnClient()

  const filteredItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.labelKey === "savedOffers" && !savedOffersEnabled) {
          return false
        }
        if (item.labelKey === "interviews" && !interviewsEnabled) {
          return false
        }
        return item.roles.includes(role)
      }),
    [interviewsEnabled, role, savedOffersEnabled],
  )

  return { isCollapsed, setIsCollapsed, filteredItems, pathname, logout }
}
