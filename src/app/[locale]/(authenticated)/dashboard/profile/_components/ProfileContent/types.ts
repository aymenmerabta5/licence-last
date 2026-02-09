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
  stats: StudentStats
  university: StudentUniversity | null
}

export interface ProfileUser {
  name: string | null
  email: string
  role: string | null | undefined
  image: string | null | undefined
  createdAt: string
}

export interface ProfileContentProps {
  user: ProfileUser
  studentData?: StudentData
}
