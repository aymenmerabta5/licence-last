"use client"

import { ChevronDownIcon, Globe } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { getLocaleLabel, triggerClassName } from "@/components/LanguageSwitcher/utils"

export function LanguageSwitcherFallback() {
  const t = useTranslations("language.switcher")
  const locale = useLocale()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled
      aria-label={t("aria")}
      className={triggerClassName}
    >
      <Globe className="h-3.5 w-3.5 text-foreground/40" aria-hidden="true" />
      <span className="min-w-8 text-start">{getLocaleLabel(t, locale)}</span>
      <ChevronDownIcon
        className="h-3.5 w-3.5 text-current opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Button>
  )
}
