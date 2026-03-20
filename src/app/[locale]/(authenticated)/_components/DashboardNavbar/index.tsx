"use client"

import { Menu } from "lucide-react"
import dynamic from "next/dynamic"
import { useSyncExternalStore } from "react"
import { useDashboard } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
import { UserDropdown } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/components/UserDropdown"
import type { NavbarUser } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/types"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useLogout } from "@/hooks/useLogout"
import { usePathname } from "@/i18n/routing"

const emptySubscribe = () => () => {}
const NotificationBell = dynamic(
  () =>
    import("@/components/NotificationBell").then((module) => ({
      default: module.NotificationBell,
    })),
  {
    loading: () => (
      <div className="h-11 w-11 rounded-full" aria-hidden="true" />
    ),
  },
)

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
  const ID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^[a-zA-Z0-9]{20,}$/i
  const lastSegment = segments[segments.length - 1] || "overview"
  // When the last segment is an ID (UUID or Better Auth base62), use the parent segment instead
  const currentSection = ID_RE.test(lastSegment)
    ? segments[segments.length - 2] || "overview"
    : lastSegment

  return (
    <header className="sticky top-0 z-20 h-24 flex items-center justify-between px-6 sm:px-12 bg-background transition-colors duration-500 border-b border-border">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
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
        <div className="min-w-0">
          <h2 className="text-2xl font-serif text-heading tracking-tight capitalize">
            {currentSection.replace(/-/g, " ")}
          </h2>
          <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground font-mono tracking-wider opacity-60">
            <span>[</span>
            <span className="uppercase">{segments[0] || "dashboard"}</span>
            <span>]</span>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {mounted && (
          <div className="flex min-w-0 items-center gap-3 border-s border-border/30 ps-3 sm:gap-4 sm:ps-4">
            <div className="hidden items-center gap-2.5 text-muted-foreground sm:flex xl:gap-3">
              <div className="hidden xl:block">
                <LanguageSwitcher />
              </div>
              <ThemeToggle />
              <NotificationBell viewerId={user.id} />
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
