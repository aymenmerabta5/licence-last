export interface UserSession {
  id: string
  tokenPrefix: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string | Date
  expiresAt: string | Date
  impersonatedBy: string | null
}
