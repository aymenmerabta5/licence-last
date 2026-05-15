"use client"

import { ArrowRight, Menu } from "lucide-react"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NAVBAR_ICON_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { NavbarMobileSessionControls } from "@/components/Navbar/components/NavbarMobileSessionControls"
import { NavbarMobileSessionControlsFallback } from "@/components/Navbar/components/NavbarMobileSessionControlsFallback"
import { NavbarSessionControls } from "@/components/Navbar/components/NavbarSessionControls"
import { NavbarSessionControlsFallback } from "@/components/Navbar/components/NavbarSessionControlsFallback"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useNavbarState } from "@/components/Navbar/hooks/useNavbarState"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Link } from "@/i18n/routing"

export function Navbar() {
  const { mobileOpen, setMobileOpen, mounted, navItems, sheetSide } =
    useNavbarState()

  return (
    <>
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-8 lg:px-16 pt-6 pb-6 border-b border-border transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => setMobileOpen(true)}
            className={`md:hidden ${NAVBAR_ICON_CONTROL_CLASS}`}
          >
            <Menu className="h-5 w-5 text-current" />
          </Button>

          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
          {mounted ? <NavbarSessionControls /> : <NavbarSessionControlsFallback />}
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
          </div>

          <div className="p-6 space-y-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium tracking-wide text-foreground/70 hover:text-primary hover:bg-secondary/30 transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-foreground/30" />
                </Link>
              ))}
            </nav>

            <Separator className="bg-border/50" />

            {mounted ? (
              <NavbarMobileSessionControls onNavigate={() => setMobileOpen(false)} />
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
