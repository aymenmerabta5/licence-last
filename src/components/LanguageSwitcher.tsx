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
import { usePathname, useRouter } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const LOCALES = ["en", "fr", "ar"] as const

const subscribeHydration = () => {
  return () => {}
}

const getHydratedSnapshot = () => true
const getServerHydratedSnapshot = () => false

const triggerClassName = cn(
  "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-3",
  "flex items-center gap-2 border border-border/30 bg-transparent px-3 py-2 select-none",
  "text-xs font-medium tracking-wide text-foreground/55 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
  "hover:border-primary hover:text-foreground/80",
  "aria-expanded:border-primary aria-expanded:text-foreground",
  "disabled:pointer-events-none disabled:opacity-50",
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
    <button
      type="button"
      disabled
      aria-label={t("aria")}
      className={triggerClassName}
    >
      <Globe className="h-3.5 w-3.5 text-foreground/40" aria-hidden="true" />
      <span className="min-w-8 text-start">
        {getLocaleLabel(t, locale)}
      </span>
      <ChevronDownIcon
        className="h-3.5 w-3.5 text-foreground/35"
        aria-hidden="true"
      />
    </button>
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
        disabled={isPending}
        aria-label={t("aria")}
        className={triggerClassName}
      >
        <Globe className="h-3.5 w-3.5 text-foreground/40" aria-hidden="true" />
        <span className="min-w-8 text-start">{getLocaleLabel(t, locale)}</span>
        <ChevronDownIcon
          className="h-3.5 w-3.5 text-foreground/35"
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
