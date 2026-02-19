import {
  BarChart3,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  FileText,
  FileUser,
  FolderTree,
  Landmark,
  LayoutDashboard,
  MessageSquareText,
  Search,
  Settings,
  Sparkles,
  Users,
  UsersRound,
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
    roles: [
      "student",
      "company_admin",
      "dept_head",
      "university_admin",
      "super_admin",
    ],
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
    labelKey: "myDocuments",
    href: "/dashboard/student/documents",
    icon: FileCheck,
    roles: ["student"],
  },
  {
    labelKey: "studentCv",
    href: "/dashboard/student/cv",
    icon: FileUser,
    roles: ["student"],
  },
  {
    labelKey: "savedOffers",
    href: "/dashboard/student/saved-offers",
    icon: Bookmark,
    roles: ["student"],
  },
  {
    labelKey: "messages",
    href: "/dashboard/messages",
    icon: MessageSquareText,
    roles: ["student", "company_admin"],
  },
  {
    labelKey: "interviews",
    href: "/dashboard/interviews",
    icon: CalendarClock,
    roles: ["student", "company_admin"],
  },
  {
    labelKey: "companyProfile",
    href: "/dashboard/company/profile",
    icon: Building2,
    roles: ["company_admin"],
  },
  {
    labelKey: "teamMembers",
    href: "/dashboard/company/team",
    icon: UsersRound,
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
    labelKey: "companyDocuments",
    href: "/dashboard/company/documents",
    icon: FileCheck,
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
    roles: ["super_admin"],
  },
  {
    labelKey: "departments",
    href: "/dashboard/admin/departments",
    icon: FolderTree,
    roles: ["university_admin"],
  },
  {
    labelKey: "statistics",
    href: "/dashboard/admin/stats",
    icon: BarChart3,
    roles: ["super_admin"],
  },
  {
    labelKey: "companies",
    href: "/dashboard/admin/companies",
    icon: Building2,
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
    roles: ["university_admin", "super_admin"],
  },
  {
    labelKey: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: [
      "student",
      "company_admin",
      "dept_head",
      "university_admin",
      "super_admin",
    ],
  },
]
