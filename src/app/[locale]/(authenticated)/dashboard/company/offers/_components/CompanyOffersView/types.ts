export interface OfferItem {
  id: string
  title: string
  status: string
  internshipType: string
  workMode: string | null
  wilayaCode: number | null
  durationWeeks: number | null
  maxPositions: number
  companyId: string
  candidatesCount: number
  skills: { id: string; name: string }[]
  languageRequirements: {
    languageCode: string
    minimumProficiency: string
    isRequired: boolean
    weight: number
  }[]
}

export type OfferStatusFilter = "all" | "draft" | "published" | "closed"

export interface TrustData {
  trustScore: number
  tier: string
  factors: {
    responseRate: number
    completionRate: number
  }
}
