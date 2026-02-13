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
}

export interface TrustData {
  trustScore: number
  tier: string
  factors: {
    responseRate: number
    completionRate: number
  }
}
