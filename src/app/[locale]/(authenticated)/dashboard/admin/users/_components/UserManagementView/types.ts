export interface AdminUser {
  id: string
  name: string | null
  email: string
  role?: string
  universityMembershipRole?: string | null
  universityName?: string | null
  departmentName?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: number | null
  createdAt: string | Date
  image?: string | null
}
