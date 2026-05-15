"use client"

import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState, useSyncExternalStore } from "react"

const subscribeHydration = () => () => {}
const getHydratedSnapshot = () => true
const getServerHydratedSnapshot = () => false

export function useNavbarState() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mounted = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  )

  const navItems = useMemo(
    () => [
      { href: "/discover" as const, label: t("discover") },
      { href: "/for-students" as const, label: t("forStudents") },
      { href: "/for-companies" as const, label: t("forRecruiters") },
      { href: "/about" as const, label: t("about") },
    ],
    [t],
  )

  const sheetSide = (locale === "ar" ? "left" : "right") as "left" | "right"

  return { mobileOpen, setMobileOpen, mounted, navItems, sheetSide }
}
