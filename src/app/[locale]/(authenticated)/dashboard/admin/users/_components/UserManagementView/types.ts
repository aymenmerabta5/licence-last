export interface AdminUser {
  id: string
  name: string | null
  email: string
  role?: string
  banned?: boolean | null
  banReason?: string | null
  banExpires?: number | null
  createdAt: string | Date
  image?: string | null
}
