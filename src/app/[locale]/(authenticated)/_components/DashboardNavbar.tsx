"use client"

import { Bell, Search, User, Menu } from "lucide-react"
import { usePathname, Link } from "@/i18n/routing"

import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboard } from "./DashboardClientProvider"
import { authClient } from "@/lib/auth-client"
import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

export function DashboardNavbar({ user }: { user: { name: string | null; email: string; role: string | null | undefined } }) {
  const pathname = usePathname()
  const { setIsSidebarOpen } = useDashboard()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const handleLogout = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.href = "/"
            }
        }
    })
  }

  // Generate a simple breadcrumb
  const segments = pathname.split("/").filter(Boolean)
  const currentSection = segments[segments.length - 1] || "overview"

  return (
    <header className="sticky top-0 z-20 h-20 flex items-center justify-between px-4 sm:px-8 bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-500">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl hover:bg-secondary/80 transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-foreground/80" />
        </button>

        {/* ── Breadcrumb/Title ── */}
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

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 sm:gap-5">
        {/* Search Bar - Improved Design */}
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
              <ThemeToggle />
            </div>

            <button className="relative p-2.5 rounded-full hover:bg-secondary/80 transition-all group">
              <Bell className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors" />
              <span className="absolute top-2.5 end-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background animate-pulse" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 rounded-full hover:bg-secondary/80 transition-all outline-none group">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px] shrink-0 group-hover:bg-primary group-hover:text-white transition-all ring-2 ring-transparent group-hover:ring-primary/20">
                    {user?.name?.charAt(0) || "U"}
                </div>
                <div className="hidden sm:block text-start pe-1">
                  <p className="text-xs font-bold leading-none text-heading">{user?.name || "User Name"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">{user?.role || "Student"}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 mt-2 p-1.5 rounded-xl border-border/40 shadow-xl backdrop-blur-xl bg-background/95">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                    Account Settings
                  </DropdownMenuLabel>
                  <Link href="/dashboard/settings">
                    <DropdownMenuItem className="rounded-lg h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                      <User className="h-4 w-4 me-2" /> Profile Settings
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator className="my-1.5 opacity-50" />
                
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className="text-destructive focus:bg-destructive/5 focus:text-destructive rounded-lg h-9 cursor-pointer transition-colors"
                    onClick={handleLogout}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  )
}
