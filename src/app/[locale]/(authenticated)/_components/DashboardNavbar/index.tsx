"use client"

import { Search, Menu } from "lucide-react"
import { usePathname } from "@/i18n/routing"
import { useSyncExternalStore } from "react"

import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationBell } from "@/components/NotificationBell"
import { useLogout } from "@/hooks/useLogout"
import { useDashboard } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
import { UserDropdown } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/components/UserDropdown"
import type { NavbarUser } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/types"

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
    <header className="sticky top-0 z-20 h-20 flex items-center justify-between ps-4 pe-6 sm:ps-8 sm:pe-10 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-colors duration-500">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-primary/5 transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-foreground/80" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5 [[dir=rtl]_&]:tracking-normal">
            Platform / {segments[0] || "Dashboard"}
          </span>
          <h2 className="text-sm font-serif font-bold capitalize text-heading">
            {currentSection.replace(/-/g, " ")}
          </h2>
        </div>
      </div>

      {/* Mobile logo */}
      <div className="md:hidden lg:block">
        <span className="font-serif text-xl tracking-tight text-heading lg:hidden">
          Internex<span className="text-primary font-bold">.</span>io
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search — editorial squared style */}
        <div className="hidden md:flex items-center w-56 lg:w-72 relative group focus-within:w-64 lg:focus-within:w-80 transition-all duration-500">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent border border-border/40 focus:border-primary/30 py-2 ps-10 pe-4 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 text-foreground"
          />
        </div>

        {/* Mobile search icon */}
        <button className="md:hidden p-2 hover:bg-primary/5 transition-all text-muted-foreground/60">
          <Search className="h-5 w-5" />
        </button>

        {mounted && (
          <>
            {/* Language + divider */}
            <div className="hidden xs:flex items-center gap-2">
              <LanguageSwitcher />
              <div className="h-5 w-px bg-border/30" />
            </div>

            <ThemeToggle />
            <NotificationBell />

            <div className="h-5 w-px bg-border/30 hidden sm:block" />

            <UserDropdown
              user={user}
              onLogout={logout}
              isLoggingOut={isLoggingOut}
            />
          </>
        )}
      </div>
    </header>
  )
}
