import type { LucideIcon } from "lucide-react"

export interface ApplicationRow {
  id: string
  status: string
  createdAt: string
  offerTitle: string
  companyName: string
  companyLogoUrl: string | null
  offerInternshipType: string
  offerWorkMode: string | null
  offerWilayaCode: number | null
}

export interface OfferRow {
  id: string
  title: string
  companyName: string
  companyLogoUrl: string | null
  internshipType: string
  workMode: string | null
  wilayaCode: number | null
  createdAt: string
  matchScore?: number
  skills: SkillTag[]
}

export interface SkillTag {
  id: string
  name: string
  slug: string
  category: string | null
}

export interface StudentDashboardStats {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  skillsCount: number
  savedOffersCount: number
  interviewsCount: number
}

export interface PendingInterview {
  id: string
  offerTitle: string
  companyName: string
  companyLogoUrl: string | null
}

export interface StudentDashboardData {
  stats: StudentDashboardStats
  recentApplications: ApplicationRow[]
  recommendedOffers: OfferRow[]
  skills: SkillTag[]
  profileCompleteness: number
  pendingInterview: PendingInterview | null
}

export interface StudentDashboardStat {
  title: string
  value: string
  description: string
  icon: LucideIcon
}

export interface StudentDashboardApplicationsLabels {
  title: string
  viewAll: string
  emptyMessage: string
  exploreButton: string
}

export interface StudentDashboardOffersLabels {
  title: string
  exploreAll: string
}

export interface StudentDashboardSkillsLabels {
  title: string
  manageSkills: string
  emptyMessage: string
  addSkills: string
}

export interface StudentDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string | null | undefined
  }
  data: StudentDashboardData
}
