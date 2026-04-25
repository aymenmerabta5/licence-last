"use client"

import { ChevronDownIcon, Globe } from "lucide-react"

import { useLocale, useTranslations } from "next-intl"
import {
  Suspense,
  useEffect,
  useSyncExternalStore,
  useTransition,
} from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NAVBAR_TEXT_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const LOCALES = ["en", "fr", "ar"] as const

const subscribeHydration = () => {
  return () => {}
}

const getHydratedSnapshot = () => true
const getServerHydratedSnapshot = () => false

const triggerClassName = cn(
  NAVBAR_TEXT_CONTROL_CLASS,
  "h-9 gap-2 px-3 select-none text-xs font-medium tracking-wide",
)

function getLocaleLabel(
  t: ReturnType<typeof useTranslations<"language.switcher">>,
  code: string,
) {
  if (code === "en") return t("en")
  if (code === "fr") return t("fr")
  if (code === "ar") return t("ar")
  return code.toUpperCase()
}

function LanguageSwitcherFallback() {
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
      <Globe
        className="h-3.5 w-3.5 text-current opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <span className="min-w-8 text-start">
        {getLocaleLabel(t, locale)}
      </span>
      <ChevronDownIcon
        className="h-3.5 w-3.5 text-current opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Button>
  )
}

function LanguageSwitcherContent() {
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

  // Sync <html> dir & lang with the active locale.
  // The root layout sets these correctly on initial SSR, but shared layouts
  // are NOT re-rendered during client-side navigations so the attributes go
  // stale when the user switches locale. This effect patches them.
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

  // Render a static placeholder during SSR / hydration to avoid Base UI's
  // useId() mismatch between server and client (identical visual output).
  if (!mounted) {
    return <LanguageSwitcherFallback />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className={triggerClassName} />}
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

export function LanguageSwitcher() {
  return (
    <Suspense fallback={<LanguageSwitcherFallback />}>
      <LanguageSwitcherContent />
    </Suspense>
  )
}
