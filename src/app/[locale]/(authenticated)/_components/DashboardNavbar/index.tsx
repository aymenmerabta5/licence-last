"use client"

import { Menu, Search } from "lucide-react"
import { useSyncExternalStore } from "react"
import { useDashboard } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
import { UserDropdown } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/components/UserDropdown"
import type { NavbarUser } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/types"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationBell } from "@/components/NotificationBell"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useLogout } from "@/hooks/useLogout"
import { usePathname } from "@/i18n/routing"

const emptySubscribe = () => () => {}

export function DashboardNavbar({ user }: { user: NavbarUser }) {
  const pathname = usePathname()
  const { setIsSidebarOpen } = useDashboard()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
  const { logout, isLoggingOut } = useLogout()

  const segments = pathname.split("/").filter(Boolean)
  const currentSection = segments[segments.length - 1] || "overview"

  return (
    <header className="sticky top-0 z-20 h-24 flex items-center justify-between px-6 sm:px-12 bg-background transition-colors duration-500 border-b border-border">

      <div className="flex items-center gap-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 -ms-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Clean minimalist breadcrumb */}
        <div className="hidden sm:flex items-baseline gap-3">
          <h2 className="text-2xl font-serif text-heading tracking-tight capitalize">
            {currentSection.replace(/-/g, " ")}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono tracking-wider opacity-60">
            <span>[</span>
            <span className="uppercase">{segments[0] || "dashboard"}</span>
            <span>]</span>
          </div>
        </div>
      </div>

      {/* Mobile logo */}
      <div className="md:hidden lg:block">
        <span className="font-serif text-xl tracking-tight text-heading lg:hidden">
          Internex<span className="text-primary font-bold">.</span>io
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Search — Minimalist underline style */}
        <div className="hidden md:flex items-center w-48 lg:w-64 relative group transition-all duration-300">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent border-b border-border/20 focus:border-primary py-1.5 px-0 text-sm focus:outline-none transition-all placeholder:text-muted-foreground/40 text-foreground font-serif italic"
          />
          <Search className="absolute end-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
        </div>

        {/* Mobile search icon */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-all"
        >
          <Search className="h-5 w-5" />
        </button>

        {mounted && (
          <div className="flex items-center gap-4 border-s border-border/30 ps-4 sm:ps-6">
            <div className="hidden xs:flex items-center gap-3 text-muted-foreground">
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationBell />
            </div>

            <UserDropdown
              user={user}
              onLogout={logout}
              isLoggingOut={isLoggingOut}
            />
          </div>
        )}
      </div>
    </header>
  )
}
