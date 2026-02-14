import type { ParsedUserAgent } from "@/lib/user-agent"

/** Session enriched with parsed user-agent info for display. */
export interface EnrichedSession {
  id: string
  token: string
  userId: string
  ipAddress?: string | null
  userAgent?: string | null
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  isCurrent: boolean
  impersonatedBy?: string
  parsed: ParsedUserAgent
}
