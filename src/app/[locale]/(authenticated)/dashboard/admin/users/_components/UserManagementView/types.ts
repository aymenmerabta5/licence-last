export interface AdminUser {
  id: string
  name: string | null
  email: string
  role?: string
  universityMembershipRole?: string | null
  universityName?: string | null
  departmentName?: string | null
  companyMemberRole?: string | null
  companyName?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: number | null
  createdAt: string | Date
  image?: string | null
  onboardingCompleted?: boolean | null
  emailVerified?: boolean | null
  companyStatus?: string | null
  universityStatus?: string | null
}

export function isUserPending(user: AdminUser): boolean {
  return (
    user.emailVerified === false ||
    user.onboardingCompleted === false ||
    (user.companyStatus != null && user.companyStatus !== "approved") ||
    (user.universityStatus != null && user.universityStatus !== "approved")
  )
}
