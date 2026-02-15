"use client"

import { useCallback, useMemo, useState } from "react"

import { useLocale, useTranslations } from "next-intl"
import { ArrowRight, LayoutDashboard, LogOut, Menu } from "lucide-react"

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
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Link, useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function Navbar() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = useMemo(
    () => [
      { href: "/discover" as const, label: t("discover") },
      { href: "/for-students" as const, label: t("forStudents") },
      { href: "/for-companies" as const, label: t("forRecruiters") },
      { href: "/about" as const, label: t("about") },
    ],
    [t]
  )

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

  const sheetSide = locale === "ar" ? "left" : "right"

  return (
    <>
      <nav
        className="relative z-20 flex items-center justify-between px-6 sm:px-8 lg:px-16 pt-6 pb-6 border-b border-border transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        aria-label={t("aria.mainNav")}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={cn(
              "md:hidden p-2.5 rounded-full hover:bg-secondary/80 transition-colors",
              "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-3"
            )}
            aria-label={t("aria.openMenu")}
          >
            <Menu className="h-5 w-5 text-foreground/70" aria-hidden="true" />
          </button>

          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            aria-label="Internex"
          >
            Internex<span className="text-primary">.</span>io
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

          {isPending ? (
            <div
              className="h-10 w-28 border border-border/40 bg-secondary/[0.08]"
              aria-hidden="true"
            />
          ) : user ? (
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
                  className={cn(
                    "flex items-center gap-2.5 p-1 rounded-full hover:bg-secondary/80 transition-all outline-none group",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3"
                  )}
                  aria-label={t("aria.accountMenu")}
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px] shrink-0 group-hover:bg-primary group-hover:text-white transition-all ring-2 ring-transparent group-hover:ring-primary/20">
                    {userInitial}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-64 mt-2 p-1.5 rounded-xl border-border/40 shadow-xl backdrop-blur-xl bg-background/95"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                      {user?.name ?? user?.email ?? "Account"}
                    </DropdownMenuLabel>
                    <Link href="/dashboard">
                      <DropdownMenuItem className="rounded-lg h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                        <LayoutDashboard className="h-4 w-4 me-2" />{" "}
                        {t("dashboard")}
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="my-1.5 opacity-50" />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/5 focus:text-destructive rounded-lg h-9 cursor-pointer transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 me-2" /> {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              variant="editorial"
              size="editorial"
              nativeButton={false}
              render={<Link href="/login" />}
              aria-label={t("aria.getStarted")}
            >
              {t("getStarted")}
            </Button>
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
              Internex<span className="text-primary">.</span>io
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
                    "text-sm font-medium tracking-wide text-foreground/70 hover:text-primary hover:bg-secondary/30 transition-colors"
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

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-heading truncate">
                      {user?.name ?? "Account"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="editorial"
                    size="editorial"
                    className="w-full"
                    nativeButton={false}
                    render={
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                      />
                    }
                  >
                    {t("dashboard")}
                  </Button>
                  <Button
                    variant="editorial-outline"
                    size="editorial"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false)
                      void handleLogout()
                    }}
                  >
                    {t("logout")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="editorial"
                  size="editorial"
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/login" onClick={() => setMobileOpen(false)} />}
                >
                  {t("getStarted")}
                </Button>
              </div>
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

