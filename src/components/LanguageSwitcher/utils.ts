import type { useTranslations } from "next-intl"

import { NAVBAR_TEXT_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { cn } from "@/lib/utils"

export const LOCALES = ["en", "fr", "ar"] as const

export const triggerClassName = cn(
  NAVBAR_TEXT_CONTROL_CLASS,
  "h-9 gap-2 px-3 select-none text-xs font-medium tracking-wide",
)

export function getLocaleLabel(
  t: ReturnType<typeof useTranslations<"language.switcher">>,
  code: string,
) {
  if (code === "en") return t("en")
  if (code === "fr") return t("fr")
  if (code === "ar") return t("ar")
  return code.toUpperCase()
}

export const subscribeHydration = () => () => {}
export const getHydratedSnapshot = () => true
export const getServerHydratedSnapshot = () => false
