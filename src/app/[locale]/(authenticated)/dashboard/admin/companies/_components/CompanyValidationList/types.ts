export interface CompanyListItem {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  representativeName: string | null
  contactEmail: string | null
  wilayaCode: number | null
  status: string
  createdAt: Date
}
