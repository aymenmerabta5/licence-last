import {
  LayoutDashboard,
  Search,
  FileText,
  Settings,
  Briefcase,
  Building2,
  Users,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

export interface NavItem {
  labelKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

export const navItems: NavItem[] = [
  {
    labelKey: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["student", "company_admin", "admin", "super_admin"],
  },
  {
    labelKey: "exploreInternships",
    href: "/dashboard/explore",
    icon: Search,
    roles: ["student"],
  },
  {
    labelKey: "myApplications",
    href: "/dashboard/applications",
    icon: FileText,
    roles: ["student"],
  },
  {
    labelKey: "companyProfile",
    href: "/dashboard/company/profile",
    icon: Building2,
    roles: ["company_admin"],
  },
  {
    labelKey: "manageOffers",
    href: "/dashboard/company/offers",
    icon: Briefcase,
    roles: ["company_admin"],
  },
  {
    labelKey: "candidatePipeline",
    href: "/dashboard/candidates",
    icon: Users,
    roles: ["company_admin"],
  },
  {
    labelKey: "assistant",
    href: "/dashboard/assistant",
    icon: Sparkles,
    roles: ["company_admin"],
  },
  {
    labelKey: "validatePlacements",
    href: "/dashboard/validate",
    icon: CheckCircle2,
    roles: ["admin", "super_admin"],
  },
  {
    labelKey: "statistics",
    href: "/dashboard/stats",
    icon: BarChart3,
    roles: ["admin", "super_admin"],
  },
  {
    labelKey: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["student", "company_admin", "admin", "super_admin"],
  },
]
