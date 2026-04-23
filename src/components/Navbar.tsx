"use client"

import { ArrowRight, LayoutDashboard, LogOut, Menu } from "lucide-react"

import { useLocale, useTranslations } from "next-intl"
import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Link, useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const subscribeHydration = () => () => {}
const getHydratedSnapshot = () => true
const getServerHydratedSnapshot = () => false

export function Navbar() {
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

  const sheetSide = locale === "ar" ? "left" : "right"

  return (
    <>
      <nav
        className="relative z-20 flex items-center justify-between px-6 sm:px-8 lg:px-16 pt-6 pb-6 border-b border-border transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        aria-label={t("aria.mainNav")}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => setMobileOpen(true)}
            className="md:hidden rounded-full text-foreground/70 hover:bg-secondary/80 hover:text-foreground"
            aria-label={t("aria.openMenu")}
          >
            <Menu className="h-5 w-5 text-foreground/70" aria-hidden="true" />
          </Button>

          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            aria-label="Stag"
          >
            Stag<span className="text-primary">.</span>io
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium tracking-wide cursor-pointer text-foreground/45 hover:text-primary transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          {mounted ? (
            <NavbarSessionControls />
          ) : (
            <NavbarSessionControlsFallback />
          )}
        </div>
      </nav>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={sheetSide}
          className="bg-background/95 backdrop-blur-xl border-border/60 p-0"
        >
          <div className="p-6 border-b border-border/50">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="font-serif text-2xl tracking-tight text-heading"
            >
              Stag<span className="text-primary">.</span>io
            </Link>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {t("menu")}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg",
                    "text-sm font-medium tracking-wide text-foreground/70 hover:text-primary hover:bg-secondary/30 transition-colors",
                  )}
                >
                  <span>{item.label}</span>
                  <ArrowRight
                    className="h-4 w-4 text-foreground/30"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>

            <Separator className="bg-border/50" />

            {mounted ? (
              <NavbarMobileSessionControls
                onNavigate={() => setMobileOpen(false)}
              />
            ) : (
              <NavbarMobileSessionControlsFallback />
            )}

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function NavbarSessionControls() {
  const t = useTranslations("nav")
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const userInitial = (user?.name || user?.email || "U")
    .slice(0, 1)
    .toUpperCase()

  const handleLogout = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/")
        },
      },
    })
  }, [router])

  if (isPending) {
    return <NavbarSessionControlsFallback />
  }

  if (!user) {
    return (
      <Button
        variant="editorial"
        size="editorial"
        nativeButton={false}
        render={<Link href="/login" />}
        aria-label={t("aria.getStarted")}
      >
        {t("getStarted")}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="editorial"
        size="editorial"
        className="hidden sm:inline-flex"
        nativeButton={false}
        render={<Link href="/dashboard" />}
        aria-label={t("aria.dashboard")}
      >
        {t("dashboard")}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              className="group rounded-full p-1 hover:bg-secondary/80"
            />
          }
          aria-label={t("aria.accountMenu")}
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px] shrink-0 group-hover:bg-primary group-hover:text-white transition-all ring-2 ring-transparent group-hover:ring-primary/20">
            {userInitial}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
              {user.name ?? user.email ?? "Account"}
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4 me-2" />
              {t("dashboard")}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5 opacity-50" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              className="h-9 cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 me-2" /> {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function NavbarSessionControlsFallback() {
  return (
    <div
      className="h-10 w-28 border border-border/40 bg-secondary/[0.08]"
      aria-hidden="true"
    />
  )
}

function NavbarMobileSessionControls({
  onNavigate,
}: {
  onNavigate: () => void
}) {
  const t = useTranslations("nav")
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const userInitial = (user?.name || user?.email || "U")
    .slice(0, 1)
    .toUpperCase()

  const handleLogout = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/")
        },
      },
    })
  }, [router])

  if (isPending) {
    return <NavbarMobileSessionControlsFallback />
  }

  if (!user) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="editorial"
          size="editorial"
          className="w-full"
          nativeButton={false}
          render={<Link href="/login" onClick={onNavigate} />}
        >
          {t("getStarted")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {userInitial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-heading truncate">
            {user.name ?? "Account"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="editorial"
          size="editorial"
          className="w-full"
          nativeButton={false}
          render={<Link href="/dashboard" onClick={onNavigate} />}
        >
          {t("dashboard")}
        </Button>
        <Button
          variant="editorial-outline"
          size="editorial"
          className="w-full"
          onClick={() => {
            onNavigate()
            void handleLogout()
          }}
        >
          {t("logout")}
        </Button>
      </div>
    </div>
  )
}

function NavbarMobileSessionControlsFallback() {
  return (
    <div
      className="h-10 w-full border border-border/40 bg-secondary/[0.08]"
      aria-hidden="true"
    />
  )
}
