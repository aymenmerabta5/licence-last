"use client"

import { useTransition } from "react"

import { useLocale, useTranslations } from "next-intl"
import { ChevronDownIcon, Globe } from "lucide-react"

import { usePathname, useRouter } from "@/i18n/routing"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const LOCALES = ["en", "fr", "ar"] as const

export function LanguageSwitcher() {
  const t = useTranslations("language.switcher")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const getLocaleLabel = (code: string) => {
    if (code === "en") return t("en")
    if (code === "fr") return t("fr")
    if (code === "ar") return t("ar")
    return code.toUpperCase()
  }

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label={t("aria")}
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-3",
          "flex items-center gap-2 rounded-full border border-border/30 bg-transparent px-3 py-2 select-none",
          "text-xs font-medium tracking-wide text-foreground/55 transition-colors",
          "hover:bg-secondary/50 hover:text-foreground/80",
          "aria-expanded:bg-secondary/60 aria-expanded:text-foreground",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        <Globe className="h-3.5 w-3.5 text-foreground/40" aria-hidden="true" />
        <span className="min-w-8 text-start">{getLocaleLabel(locale)}</span>
        <ChevronDownIcon
          className="h-3.5 w-3.5 text-foreground/35"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
          {LOCALES.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} disabled={isPending}>
              {getLocaleLabel(code)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
