"use client"

import { useState, useMemo } from "react"
import { usePathname } from "@/i18n/routing"
import { useLogout } from "@/hooks/useLogout"
import { navItems } from "../constants"

export function useSidebar(role: string) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useLogout()

  const filteredItems = useMemo(
    () => navItems.filter((item) => item.roles.includes(role)),
    [role]
  )

  return { isCollapsed, setIsCollapsed, filteredItems, pathname, logout }
}
