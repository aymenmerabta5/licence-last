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
  GraduationCap,
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
  companyMembershipRoles?: string[]
  universityMembershipRoles?: string[]
  hideForUniversityMembershipRoles?: string[]
}

export const navItems: NavItem[] = [
  {
    labelKey: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "student",
      "company_admin",

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
    labelKey: "discoverCompanies",
    href: "/dashboard/student/companies",
    icon: Building2,
    roles: ["student"],
  },
  {
    labelKey: "myApplications",
    href: "/dashboard/applications",
    icon: FileText,
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
    roles: ["company_admin"],
  },
  {
    labelKey: "companyProfile",
    href: "/dashboard/company/profile",
    icon: Building2,
    roles: ["company_admin"],
    companyMembershipRoles: ["owner"],
  },
  {
    labelKey: "teamMembers",
    href: "/dashboard/company/team",
    icon: UsersRound,
    roles: ["company_admin"],
    companyMembershipRoles: ["owner"],
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
    roles: ["university_admin"],
    universityMembershipRoles: ["department_head"],
  },
  {
    labelKey: "validatePlacements",
    href: "/dashboard/admin/validations",
    icon: CheckCircle2,
    roles: ["university_admin"],
    hideForUniversityMembershipRoles: ["department_head"],
  },
  {
    labelKey: "departments",
    href: "/dashboard/admin/departments",
    icon: FolderTree,
    roles: ["university_admin"],
    hideForUniversityMembershipRoles: ["department_head"],
  },
  {
    labelKey: "fields",
    href: "/dashboard/admin/fields",
    icon: GraduationCap,
    roles: ["super_admin"],
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
    hideForUniversityMembershipRoles: ["department_head"],
  },
  {
    labelKey: "universityProfile",
    href: "/dashboard/university/profile",
    icon: Landmark,
    roles: ["university_admin"],
    hideForUniversityMembershipRoles: ["department_head"],
  },
  {
    labelKey: "siteSettings",
    href: "/dashboard/admin/site-settings",
    icon: Settings,
    roles: ["super_admin"],
  },
  {
    labelKey: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: [
      "student",
      "company_admin",

      "university_admin",
      "super_admin",
    ],
  },
]
