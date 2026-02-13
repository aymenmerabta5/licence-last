export interface UserSession {
  id: string
  token: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string | Date
  expiresAt: string | Date
  impersonatedBy: string | null
}
