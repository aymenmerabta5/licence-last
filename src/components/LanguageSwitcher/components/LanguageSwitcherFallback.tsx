"use client"

import { ChevronDownIcon, Globe } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { NAVBAR_ICON_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { Button } from "@/components/ui/button"
import { getLocaleLabel, triggerClassName } from "@/components/LanguageSwitcher/utils"

export function LanguageSwitcherFallback({ compact }: { compact?: boolean }) {
  const t = useTranslations("language.switcher")
  const locale = useLocale()

  return (
    <Button
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon-lg" : "sm"}
      disabled
      aria-label={t("aria")}
      className={compact ? NAVBAR_ICON_CONTROL_CLASS : triggerClassName}
    >
      <Globe
        className={compact ? "h-4 w-4 text-foreground/40" : "h-3.5 w-3.5 text-foreground/40"}
        aria-hidden="true"
      />
      {!compact && (
        <>
          <span className="min-w-8 text-start">{getLocaleLabel(t, locale)}</span>
          <ChevronDownIcon
            className="h-3.5 w-3.5 text-current opacity-60 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
        </>
      )}
    </Button>
  )
}
