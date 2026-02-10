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
}

export interface StudentDashboardData {
  stats: StudentDashboardStats
  recentApplications: ApplicationRow[]
  recommendedOffers: OfferRow[]
  skills: SkillTag[]
  profileCompleteness: number
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
