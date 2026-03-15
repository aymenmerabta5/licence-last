export interface StudentProfile {
  bio: string | null
  phone: string | null
  wilayaCode: number | null
  githubUrl: string | null
  portfolioUrl: string | null
  studentNumber: string | null
  department: string | null
  level: string | null
  address: string | null
}

export interface StudentSkill {
  id: string
  name: string
  slug: string
  category: string | null
}

export interface StudentExperience {
  id: string
  title: string
  organization: string
  description: string | null
  startDate: Date
  endDate: Date | null
  isCurrent: boolean
}

export interface StudentStats {
  totalApplications: number
  skillsCount: number
  profileCompleteness: number
}

export interface StudentUniversity {
  id: string
  name: string
  abbreviation: string | null
  city: string | null
}

export interface StudentData {
  profile: StudentProfile | null
  skills: StudentSkill[]
  experiences: StudentExperience[]
  university: StudentUniversity | null
  stats: StudentStats | null
}

export interface ViewerIdentity {
  id: string
  role: string | null | undefined
  effectiveRole?: string | null
}

export interface ProfileUser {
  id: string
  name: string | null
  email: string | null
  role: string | null | undefined
  effectiveRole?: string | null
  image: string | null | undefined
  createdAt: string
}

export interface ProfileContentProps {
  viewer: ViewerIdentity
  user: ProfileUser
  studentData?: StudentData
}
