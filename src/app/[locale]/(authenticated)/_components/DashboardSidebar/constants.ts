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
  Shield,
  UsersRound,
  Landmark,
  ClipboardCheck,
  FolderTree,
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
    roles: ["student", "company_admin", "dept_head", "university_admin", "super_admin"],
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
    labelKey: "deptValidations",
    href: "/dashboard/dept-validations",
    icon: ClipboardCheck,
    roles: ["dept_head"],
  },
  {
    labelKey: "validatePlacements",
    href: "/dashboard/admin/validations",
    icon: CheckCircle2,
    roles: ["university_admin", "super_admin"],
  },
  {
    labelKey: "departments",
    href: "/dashboard/admin/departments",
    icon: FolderTree,
    roles: ["university_admin", "super_admin"],
  },
  {
    labelKey: "statistics",
    href: "/dashboard/admin/stats",
    icon: BarChart3,
    roles: ["university_admin", "super_admin"],
  },
  {
    labelKey: "commandCenter",
    href: "/dashboard/admin/command-center",
    icon: Shield,
    roles: ["super_admin"],
  },
  {
    labelKey: "universities",
    href: "/dashboard/admin/universities",
    icon: Landmark,
    roles: ["super_admin"],
  },
  {
    labelKey: "userManagement",
    href: "/dashboard/admin/users",
    icon: UsersRound,
    roles: ["super_admin"],
  },
  {
    labelKey: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["student", "company_admin", "dept_head", "university_admin", "super_admin"],
  },
]
