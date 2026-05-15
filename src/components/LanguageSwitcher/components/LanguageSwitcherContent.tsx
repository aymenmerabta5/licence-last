"use client"

import { ChevronDownIcon, Globe } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useSyncExternalStore, useTransition } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getLocaleLabel,
  getHydratedSnapshot,
  getServerHydratedSnapshot,
  LOCALES,
  subscribeHydration,
  triggerClassName,
} from "@/components/LanguageSwitcher/utils"
import { usePathname, useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { LanguageSwitcherFallback } from "@/components/LanguageSwitcher/components/LanguageSwitcherFallback"

export function LanguageSwitcherContent() {
  const t = useTranslations("language.switcher")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const mounted = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  )

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = locale
    document.documentElement.dir = dir

    if (dir === "rtl") {
      document.body.style.setProperty(
        "--font-sans",
        "var(--font-arabic), var(--font-dm-sans)",
      )
      document.body.style.setProperty(
        "--font-serif",
        "var(--font-arabic), var(--font-dm-serif)",
      )
    } else {
      document.body.style.removeProperty("--font-sans")
      document.body.style.removeProperty("--font-serif")
    }
  }, [locale])

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
    })
  }

  if (!mounted) {
    return <LanguageSwitcherFallback />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className={triggerClassName} />
        }
        disabled={isPending}
        aria-label={t("aria")}
      >
        <Globe
          className="h-3.5 w-3.5 text-current opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <span className="min-w-8 text-start">{getLocaleLabel(t, locale)}</span>
        <ChevronDownIcon
          className="h-3.5 w-3.5 text-current opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleLocaleChange}
        >
          {LOCALES.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} disabled={isPending}>
              {getLocaleLabel(t, code)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
