"use client"

import * as motion from "motion/react-client"
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Settings,
  Briefcase,
  Users,
  BarChart3,
  CheckCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Link, usePathname } from "@/i18n/routing"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["student", "company_admin", "admin", "super_admin"],
  },
  {
    label: "Explore Internships",
    href: "/dashboard/explore",
    icon: Search,
    roles: ["student"],
  },
  {
    label: "My Applications",
    href: "/dashboard/applications",
    icon: FileText,
    roles: ["student"],
  },
  {
    label: "Manage Offers",
    href: "/dashboard/offers",
    icon: Briefcase,
    roles: ["company_admin"],
  },
  {
    label: "Candidate Pipeline",
    href: "/dashboard/candidates",
    icon: Users,
    roles: ["company_admin"],
  },
  {
    label: "Validate Placements",
    href: "/dashboard/validate",
    icon: CheckCircle2,
    roles: ["admin", "super_admin"],
  },
  {
    label: "Statistics",
    href: "/dashboard/stats",
    icon: BarChart3,
    roles: ["admin", "super_admin"],
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["student", "company_admin", "admin", "super_admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["student", "company_admin", "admin", "super_admin"],
  },
]

export function DashboardSidebar({ role = "student" }: { role?: string }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const filteredItems = navItems.filter((item) => item.roles.includes(role))

  const handleLogout = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.href = "/"
            }
        }
    })
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "relative sticky top-0 h-screen flex flex-col border-e border-border/50 bg-background transition-colors duration-500",
        "z-30"
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-8 h-20">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-serif text-2xl tracking-tight text-heading"
          >
            Internex<span className="text-primary">.</span>io
          </motion.span>
        )}
        {isCollapsed && (
          <span className="font-serif text-2xl font-bold text-primary mx-auto">I.</span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href as "/dashboard"}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm tracking-wide"
                  >
                    {item.label}
                  </motion.span>
                )}
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute start-0 w-1 h-6 bg-primary rounded-e-full"
                  />
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-300",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center w-full h-8 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
