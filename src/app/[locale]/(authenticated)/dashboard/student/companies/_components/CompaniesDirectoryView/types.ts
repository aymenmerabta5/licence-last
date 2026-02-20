export interface CompanyDirectoryCursor {
  createdAt: string
  id: string
}

export interface CompanyDirectoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  wilayaCode: number | null
  createdAt: Date
  openOffersCount: number
}
