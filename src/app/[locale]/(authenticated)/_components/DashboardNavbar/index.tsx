"use client"

import { Search, Menu } from "lucide-react"
import { usePathname } from "@/i18n/routing"
import { useSyncExternalStore } from "react"

import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationBell } from "@/components/NotificationBell"
import { useLogout } from "@/hooks/useLogout"
import { useDashboard } from "../DashboardClientProvider"
import { UserDropdown } from "./components/UserDropdown"
import type { NavbarUser } from "./types"

const emptySubscribe = () => () => {}

export function DashboardNavbar({ user }: { user: NavbarUser }) {
  const pathname = usePathname()
  const { setIsSidebarOpen } = useDashboard()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const { logout, isLoggingOut } = useLogout()

  const segments = pathname.split("/").filter(Boolean)
  const currentSection = segments[segments.length - 1] || "overview"

  return (
    <header className="sticky top-0 z-20 h-20 flex items-center justify-between ps-4 pe-6 sm:ps-8 sm:pe-10 bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl hover:bg-secondary/80 transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-foreground/80" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70 font-bold mb-0.5">
            Platform / {segments[0] || "Dashboard"}
          </span>
          <h2 className="text-sm font-serif font-bold capitalize text-heading">
            {currentSection.replace(/-/g, " ")}
          </h2>
        </div>
      </div>

      <div className="md:hidden lg:block">
        <span className="font-serif text-xl tracking-tight text-heading lg:hidden">
          Internex<span className="text-primary">.</span>io
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-5">
        <div className="hidden md:flex items-center w-64 lg:w-80 relative group focus-within:w-72 lg:focus-within:w-96 transition-all duration-500">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-secondary/[0.08] hover:bg-secondary/[0.12] border border-transparent focus:bg-background focus:border-primary/20 rounded-full py-2.5 ps-11 pe-5 text-[13px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all outline-none"
          />
        </div>

        <button className="md:hidden p-2.5 rounded-full hover:bg-secondary/80 transition-all text-muted-foreground/70">
          <Search className="h-5 w-5" />
        </button>

        {mounted && (
          <>
            <div className="hidden xs:flex items-center gap-3">
              <LanguageSwitcher />
              <div className="h-4 w-px bg-border/40 mx-1" />
            </div>

            <ThemeToggle />
            <NotificationBell />

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
